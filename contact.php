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

$recipient = 'ak5974828@gmail.com';
$sender = 'unnatixtechnologies@gmail.com';
$mailSubject = 'Portfolio Enquiry: ' . $subject;
$mailBody = "New enquiry from ankushkumar.in\n\n"
    . "Name: {$name}\n"
    . "Email: {$email}\n"
    . "Subject: {$subject}\n\n"
    . "Message:\n{$message}\n";

$headers = [
    'From: Unnatix Technologies <' . $sender . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($recipient, $mailSubject, $mailBody, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Message could not be sent right now. Please contact me directly by email or WhatsApp.']);
    exit;
}

echo json_encode(['ok' => true, 'message' => 'Thank you! Your message has been sent successfully.']);
