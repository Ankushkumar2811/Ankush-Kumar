<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Honeypot field: real visitors never fill this input.
if (!empty($_POST['website'] ?? '')) {
    echo json_encode(['ok' => true, 'message' => 'Thank you. Your message has been sent.']);
    exit;
}

function clean_line(string $value): string {
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

$name = clean_line((string)($_POST['name'] ?? ''));
$email = filter_var(trim((string)($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$subject = clean_line((string)($_POST['subject'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || $email === false || $subject === '' || $message === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Please complete all fields with valid information.']);
    exit;
}

if (mb_strlen($name) > 100 || mb_strlen($subject) > 180 || mb_strlen($message) > 5000) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Your message is too long. Please shorten it and try again.']);
    exit;
}

$configCandidates = [
    dirname(__DIR__) . DIRECTORY_SEPARATOR . 'mail-config.php', // Preferred: outside public_html.
    __DIR__ . DIRECTORY_SEPARATOR . 'mail-config.php',         // Local testing/private manual upload fallback.
];
$config = [];
foreach ($configCandidates as $privateConfig) {
    if (is_file($privateConfig)) {
        $config = (array) require $privateConfig;
        break;
    }
}
$env = static function (string $key, string $fallback = '') use ($config): string {
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return (string) $value;
    }
    return isset($config[$key]) ? (string) $config[$key] : $fallback;
};

$smtpHost = $env('SMTP_HOST', 'smtp.gmail.com');
$smtpPort = (int) $env('SMTP_PORT', '587');
$smtpUser = $env('SMTP_USER', 'unnatixtechnologies@gmail.com');
$smtpPassword = $env('SMTP_PASSWORD');
$sender = $env('SMTP_FROM_EMAIL', 'unnatixtechnologies@gmail.com');
$senderName = $env('SMTP_FROM_NAME', 'UnnatiX Technologies');
$smtpSecurity = strtolower($env('SMTP_SECURITY', 'starttls'));
$recipient = 'ak5974828@gmail.com';

$mailSubject = 'Portfolio Enquiry: ' . $subject;
$mailBody = "New enquiry from ankushkumar.in\n\n"
    . "Name: {$name}\n"
    . "Email: {$email}\n"
    . "Subject: {$subject}\n\n"
    . "Message:\n{$message}\n";

function smtp_send(
    string $host,
    int $port,
    string $security,
    string $username,
    string $password,
    string $fromEmail,
    string $fromName,
    string $replyEmail,
    string $replyName,
    string $toEmail,
    string $subject,
    string $body
): bool {
    $transport = $security === 'ssl' ? 'ssl://' : 'tcp://';
    $sslOptions = [
        'verify_peer' => true,
        'verify_peer_name' => true,
        'peer_name' => $host,
        'SNI_enabled' => true,
    ];
    $caCandidates = array_filter([
        __DIR__ . DIRECTORY_SEPARATOR . 'cacert.pem',
        (string) ini_get('openssl.cafile'),
        (string) ini_get('curl.cainfo'),
        'C:\\xampp\\apache\\bin\\curl-ca-bundle.crt',
    ]);
    foreach ($caCandidates as $caFile) {
        if (is_file($caFile)) {
            $sslOptions['cafile'] = $caFile;
            break;
        }
    }
    $context = stream_context_create(['ssl' => $sslOptions]);
    $socket = @stream_socket_client($transport . $host . ':' . $port, $errorNumber, $errorMessage, 20, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        error_log('SMTP connection failed: ' . $errorNumber . ' ' . $errorMessage);
        return false;
    }
    stream_set_timeout($socket, 20);

    $read = static function () use ($socket): string {
        $response = '';
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') break;
        }
        return $response;
    };
    $command = static function (string $value, array $expected) use ($socket, $read): bool {
        fwrite($socket, $value . "\r\n");
        $response = $read();
        return in_array((int) substr($response, 0, 3), $expected, true);
    };

    if ((int) substr($read(), 0, 3) !== 220 || !$command('EHLO ankushkumar.in', [250])) {
        fclose($socket);
        return false;
    }
    if ($security === 'starttls') {
        if (!$command('STARTTLS', [220]) || !stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) || !$command('EHLO ankushkumar.in', [250])) {
            fclose($socket);
            return false;
        }
    }
    if (!$command('AUTH LOGIN', [334]) || !$command(base64_encode($username), [334]) || !$command(base64_encode($password), [235])) {
        fclose($socket);
        return false;
    }
    if (!$command('MAIL FROM:<' . $fromEmail . '>', [250]) || !$command('RCPT TO:<' . $toEmail . '>', [250, 251]) || !$command('DATA', [354])) {
        fclose($socket);
        return false;
    }

    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
    $encodedReplyName = '=?UTF-8?B?' . base64_encode($replyName) . '?=';
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $normalizedBody = str_replace(["\r\n", "\r"], "\n", $body);
    $normalizedBody = str_replace("\n", "\r\n", $normalizedBody);
    $normalizedBody = preg_replace('/(?m)^\./', '..', $normalizedBody) ?? $normalizedBody;
    $headers = [
        'Date: ' . date(DATE_RFC2822),
        'From: ' . $encodedFromName . ' <' . $fromEmail . '>',
        'To: <' . $toEmail . '>',
        'Reply-To: ' . $encodedReplyName . ' <' . $replyEmail . '>',
        'Subject: ' . $encodedSubject,
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@ankushkumar.in>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $normalizedBody . "\r\n.\r\n");
    $accepted = (int) substr($read(), 0, 3) === 250;
    $command('QUIT', [221]);
    fclose($socket);
    return $accepted;
}

$sent = false;
if ($smtpPassword !== '') {
    $sent = smtp_send($smtpHost, $smtpPort, $smtpSecurity, $smtpUser, $smtpPassword, $sender, $senderName, (string)$email, $name, $recipient, $mailSubject, $mailBody);
} else {
    // Hostinger fallback: keeps the form operational until the private SMTP config is installed.
    $fallbackHeaders = [
        'From: ' . $senderName . ' <' . $sender . '>',
        'Reply-To: ' . $name . ' <' . (string)$email . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
    ];
    $sent = mail($recipient, $mailSubject, $mailBody, implode("\r\n", $fallbackHeaders));
}

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Message could not be sent right now. Please contact me directly by email or WhatsApp.']);
    exit;
}

echo json_encode(['ok' => true, 'message' => 'Thank you! Your message has been sent successfully.']);
