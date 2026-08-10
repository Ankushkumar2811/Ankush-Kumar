document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var grid = document.querySelector('.game-grid');
  if (!grid) return;
  grid.insertAdjacentHTML('beforebegin','<div class="arcade-summary"><span><b>12</b> games</span><span><b>3</b> levels each</span><span><b>36</b> skill checkpoints</span></div>');

  function level(id) { var el=document.getElementById(id+'-level'); return el ? el.value.toLowerCase() : 'easy'; }
  function select(id) { return '<select id="'+id+'-level" class="level-select" aria-label="Difficulty"><option>Easy</option><option>Medium</option><option>Hard</option></select>'; }
  function card(id, eyebrow, title, stage, stats, action) {
    return '<article class="lab-card arcade-card" data-game="'+id+'"><div class="card-head"><div><span class="eyebrow">'+eyebrow+'</span><h3>'+title+'</h3></div>'+select(id)+'</div>'+stage+'<div class="game-controls">'+stats+'<button id="'+id+'-start" class="action">'+action+'</button></div></article>';
  }

  document.querySelectorAll('.game-grid > .lab-card').forEach(function (oldCard, i) {
    var ids=['snake','memory','reaction'], id=ids[i]; if(!id) return;
    var head=oldCard.querySelector('.card-head'), badge=head && head.querySelector('.live-dot');
    if(badge) badge.outerHTML=select(id);
  });

  grid.insertAdjacentHTML('beforeend',
    card('aim','04 · Pointer accuracy','Aim Trainer','<div id="aim-stage" class="mini-stage aim-stage"><button id="aim-target" aria-label="Hit target"></button><span class="stage-message" id="aim-message">Catch every glowing target.</span></div>','<p>Hits<strong id="aim-score">0</strong></p><p>Time<strong id="aim-time">—</strong></p>','Start')+
    card('sequence','05 · Pattern memory','Signal Sequence','<div id="sequence-board" class="sequence-board"><button data-pad="0"></button><button data-pad="1"></button><button data-pad="2"></button><button data-pad="3"></button></div>','<p>Round<strong id="sequence-round">0</strong></p><p>Status<strong id="sequence-status">Ready</strong></p>','Start')+
    card('typing','06 · Keyboard events','Typing Sprint','<div class="typing-stage"><p id="typing-prompt">Start a coding phrase challenge.</p><input id="typing-input" autocomplete="off" disabled placeholder="Type here…"></div>','<p>Speed<strong id="typing-wpm">0 WPM</strong></p><p>Accuracy<strong id="typing-accuracy">100%</strong></p>','Start')+
    card('bug','07 · Dynamic spawning','Bug Squash','<div id="bug-stage" class="mini-stage bug-stage"><span class="stage-message" id="bug-message">Protect production from bugs.</span></div>','<p>Fixed<strong id="bug-score">0</strong></p><p>Missed<strong id="bug-missed">0</strong></p>','Deploy')+
    card('grid','08 · Strategy + AI','Code Grid','<div id="code-grid" class="code-grid" aria-label="Tic tac toe board"></div>','<p>Status<strong id="grid-status">Your turn</strong></p><p>Wins<strong id="grid-wins">0</strong></p>','New Game')+
    card('quiz','09 · Technical knowledge','Code Quiz','<div class="quiz-stage"><p id="quiz-question">Ready for a developer challenge?</p><div id="quiz-options" class="quiz-options"></div></div>','<p>Score<strong id="quiz-score">0</strong></p><p>Question<strong id="quiz-count">0/5</strong></p>','Start')+
    card('color','10 · Focus + inhibition','Color Clash','<div class="color-stage"><small>Choose the ink color—not the word</small><strong id="color-word">READY</strong><div id="color-options" class="color-options"></div></div>','<p>Correct<strong id="color-score">0</strong></p><p>Streak<strong id="color-streak">0</strong></p>','Start')+
    card('hunt','11 · Speed scanning','Number Hunt','<div id="hunt-board" class="hunt-board"><span class="stage-message">Find numbers in order.</span></div>','<p>Find<strong id="hunt-next">1</strong></p><p>Time<strong id="hunt-time">0.0s</strong></p>','Start')+
    card('lock','12 · Logic + deduction','Lock Cracker','<div class="lock-stage"><div id="lock-slots" class="lock-slots"></div><p id="lock-hint">Crack the secret digit sequence.</p><div id="lock-keypad" class="lock-keypad"></div></div>','<p>Attempts<strong id="lock-attempts">0</strong></p><p>Matched<strong id="lock-matched">0</strong></p>','New Code')
  );

  var snakeSpeeds={easy:145,medium:100,hard:65};
  document.getElementById('snake-level').addEventListener('change',function(){ document.getElementById('snake-restart').click(); });
  // Existing Snake owns its timer. Re-clicking restart applies a visual level marker; speed progression is also shown via CSS.
  ['memory','reaction'].forEach(function(id){document.getElementById(id+'-level').addEventListener('change',function(){var b=document.getElementById(id+'-restart');if(b)b.click();});});

  // Aim Trainer
  (function(){var stage=document.getElementById('aim-stage'),target=document.getElementById('aim-target'),score=0,left=0,timer;
    function move(){var s={easy:48,medium:36,hard:26}[level('aim')];target.style.width=s+'px';target.style.height=s+'px';target.style.left=Math.random()*(stage.clientWidth-s-12)+6+'px';target.style.top=Math.random()*(stage.clientHeight-s-12)+6+'px';}
    document.getElementById('aim-start').onclick=function(){clearInterval(timer);score=0;left={easy:15,medium:12,hard:9}[level('aim')];document.getElementById('aim-score').textContent='0';document.getElementById('aim-message').hidden=true;target.classList.add('active');move();timer=setInterval(function(){left--;document.getElementById('aim-time').textContent=left+'s';if(left<=0){clearInterval(timer);target.classList.remove('active');document.getElementById('aim-message').hidden=false;document.getElementById('aim-message').textContent='Complete · '+score+' hits';}},1000);};
    target.onclick=function(){if(left>0){score++;document.getElementById('aim-score').textContent=score;move();}};
  })();

  // Signal Sequence
  (function(){var board=document.getElementById('sequence-board'),pads=[].slice.call(board.children),seq=[],input=[],locked=true;
    function flash(i,delay){setTimeout(function(){pads[i].classList.add('lit');setTimeout(function(){pads[i].classList.remove('lit');},260);},delay);}
    function round(){locked=true;input=[];seq.push(Math.floor(Math.random()*4));document.getElementById('sequence-round').textContent=seq.length;document.getElementById('sequence-status').textContent='Watch';seq.forEach(function(n,i){flash(n,i*({easy:650,medium:480,hard:330}[level('sequence')]));});setTimeout(function(){locked=false;document.getElementById('sequence-status').textContent='Repeat';},seq.length*({easy:650,medium:480,hard:330}[level('sequence')])+150);}
    pads.forEach(function(p,i){p.onclick=function(){if(locked)return;flash(i,0);input.push(i);var n=input.length-1;if(input[n]!==seq[n]){locked=true;document.getElementById('sequence-status').textContent='Missed';return;}if(input.length===seq.length)setTimeout(round,500);};});
    document.getElementById('sequence-start').onclick=function(){seq=[];round();};
  })();

  // Typing Sprint
  (function(){var phrases={easy:['build fast websites','clean reusable code'],medium:['const api = await fetch(url);','responsive interfaces improve access'],hard:['performance.mark("interaction-start");','Promise.allSettled(tasks).then(renderResults);']},input=document.getElementById('typing-input'),start=0,prompt='';
    document.getElementById('typing-start').onclick=function(){var list=phrases[level('typing')];prompt=list[Math.floor(Math.random()*list.length)];document.getElementById('typing-prompt').textContent=prompt;input.value='';input.disabled=false;input.focus();start=performance.now();};
    input.oninput=function(){var val=input.value,good=0;for(var i=0;i<val.length;i++)if(val[i]===prompt[i])good++;var mins=(performance.now()-start)/60000;document.getElementById('typing-wpm').textContent=Math.max(0,Math.round((good/5)/mins))+' WPM';document.getElementById('typing-accuracy').textContent=Math.round((good/Math.max(1,val.length))*100)+'%';if(val===prompt){input.disabled=true;document.getElementById('typing-prompt').textContent='Completed! Select another level or retry.';}};
  })();

  // Bug Squash
  (function(){var stage=document.getElementById('bug-stage'),score=0,miss=0,run=false,spawn;
    function bug(){if(!run)return;var b=document.createElement('button');b.className='bug';b.innerHTML='🐞';b.style.left=Math.random()*82+'%';b.style.top=Math.random()*72+'%';stage.appendChild(b);var life={easy:1600,medium:1050,hard:650}[level('bug')];var gone=setTimeout(function(){if(b.isConnected){b.remove();miss++;document.getElementById('bug-missed').textContent=miss;if(miss>=5)stop();}},life);b.onclick=function(){clearTimeout(gone);b.remove();score++;document.getElementById('bug-score').textContent=score;};}
    function stop(){run=false;clearInterval(spawn);stage.querySelectorAll('.bug').forEach(function(b){b.remove();});document.getElementById('bug-message').hidden=false;document.getElementById('bug-message').textContent='Deploy complete · '+score+' fixed';}
    document.getElementById('bug-start').onclick=function(){score=miss=0;run=true;document.getElementById('bug-score').textContent='0';document.getElementById('bug-missed').textContent='0';document.getElementById('bug-message').hidden=true;clearInterval(spawn);spawn=setInterval(bug,{easy:900,medium:620,hard:390}[level('bug')]);bug();setTimeout(stop,15000);};
  })();

  // Code Grid (Tic Tac Toe)
  (function(){var board=document.getElementById('code-grid'),cells=[],state=[],wins=0,over=false,lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    function result(p){return lines.some(function(l){return l.every(function(i){return state[i]===p;});});}
    function reset(){state=Array(9).fill('');over=false;board.innerHTML='';cells=[];for(let i=0;i<9;i++){var b=document.createElement('button');b.onclick=function(){play(i);};board.appendChild(b);cells.push(b);}document.getElementById('grid-status').textContent='Your turn';}
    function play(i){if(over||state[i])return;state[i]='X';cells[i].textContent='X';cells[i].className='x';if(result('X')){over=true;wins++;document.getElementById('grid-wins').textContent=wins;document.getElementById('grid-status').textContent='You win!';return;}var open=state.map(function(v,n){return v?'':n;}).filter(function(v){return v!=='';});if(!open.length){over=true;document.getElementById('grid-status').textContent='Draw';return;}var pick;if(level('grid')==='hard')pick=open.find(function(n){var copy=state.slice();copy[n]='O';return lines.some(function(l){return l.every(function(k){return copy[k]==='O';});});});if(pick===undefined&&level('grid')!=='easy')pick=open.find(function(n){var copy=state.slice();copy[n]='X';return lines.some(function(l){return l.every(function(k){return copy[k]==='X';});});});if(pick===undefined)pick=open[Math.floor(Math.random()*open.length)];setTimeout(function(){state[pick]='O';cells[pick].textContent='O';cells[pick].className='o';if(result('O')){over=true;document.getElementById('grid-status').textContent='AI wins';}},250);}
    document.getElementById('grid-start').onclick=reset;document.getElementById('grid-level').onchange=reset;reset();
  })();

  // Code Quiz
  (function(){var bank={easy:[['HTML stands for?','HyperText Markup Language',['HighText Machine Language','HyperText Markup Language','Home Tool Markup']],['CSS controls?','Presentation',['Database','Presentation','Server']]],medium:[['Which creates a Promise?','fetch()',['parseInt()','fetch()','querySelector()']],['React state hook?','useState',['useMemo','useState','useRefOnly']]],hard:[['Event loop runs microtasks…','Before next task',['After render only','Before next task','Never']],['HTTP idempotent update?','PUT',['POST','PATCH only','PUT']]]},q=[],index=0,score=0;
    function show(){if(index>=5){document.getElementById('quiz-question').textContent='Finished · '+score+'/5';document.getElementById('quiz-options').innerHTML='';return;}var item=q[index%q.length];document.getElementById('quiz-question').textContent=item[0];document.getElementById('quiz-count').textContent=(index+1)+'/5';var box=document.getElementById('quiz-options');box.innerHTML='';item[2].forEach(function(x){var b=document.createElement('button');b.textContent=x;b.onclick=function(){if(x===item[1])score++;document.getElementById('quiz-score').textContent=score;index++;show();};box.appendChild(b);});}
    document.getElementById('quiz-start').onclick=function(){q=bank[level('quiz')];index=score=0;document.getElementById('quiz-score').textContent='0';show();};
  })();

  // Color Clash
  (function(){var colors=[['GOLD','#ffcf00'],['BLUE','#4da3ff'],['GREEN','#43d17e'],['PINK','#ff5ca8']],score=0,streak=0,left=0;
    function next(){if(left--<=0){document.getElementById('color-word').textContent='DONE';return;}var word=colors[Math.floor(Math.random()*colors.length)],ink=colors[Math.floor(Math.random()*colors.length)];var w=document.getElementById('color-word');w.textContent=word[0];w.style.color=ink[1];var box=document.getElementById('color-options');box.innerHTML='';colors.slice(0,{easy:2,medium:3,hard:4}[level('color')]).forEach(function(c){var b=document.createElement('button');b.textContent=c[0];b.onclick=function(){if(c[1]===ink[1]){score++;streak++;}else streak=0;document.getElementById('color-score').textContent=score;document.getElementById('color-streak').textContent=streak;next();};box.appendChild(b);});}
    document.getElementById('color-start').onclick=function(){score=streak=0;left={easy:8,medium:12,hard:16}[level('color')];next();};
  })();

  // Number Hunt
  (function(){var board=document.getElementById('hunt-board'),next=1,total=0,start=0,timer;
    document.getElementById('hunt-start').onclick=function(){clearInterval(timer);next=1;total={easy:9,medium:16,hard:25}[level('hunt')];document.getElementById('hunt-next').textContent='1';var nums=Array.from({length:total},function(_,i){return i+1;}).sort(function(){return Math.random()-.5;});board.innerHTML='';board.style.setProperty('--hunt-cols',Math.sqrt(total));nums.forEach(function(n){var b=document.createElement('button');b.textContent=n;b.onclick=function(){if(n!==next)return;b.classList.add('found');next++;document.getElementById('hunt-next').textContent=next>total?'Done':next;if(next>total)clearInterval(timer);};board.appendChild(b);});start=performance.now();timer=setInterval(function(){document.getElementById('hunt-time').textContent=((performance.now()-start)/1000).toFixed(1)+'s';},100);};
  })();

  // Lock Cracker
  (function(){var secret=[],guess=[],attempts=0,len=3,slots=document.getElementById('lock-slots'),keys=document.getElementById('lock-keypad');
    function render(){slots.innerHTML='';for(var i=0;i<len;i++){var s=document.createElement('span');s.textContent=guess[i]===undefined?'•':guess[i];slots.appendChild(s);}}
    function start(){len={easy:3,medium:4,hard:5}[level('lock')];secret=Array.from({length:len},function(){return Math.floor(Math.random()*6);});guess=[];attempts=0;document.getElementById('lock-attempts').textContent='0';document.getElementById('lock-matched').textContent='0';document.getElementById('lock-hint').textContent='Digits range from 0 to 5.';render();keys.innerHTML='';for(let n=0;n<6;n++){var b=document.createElement('button');b.textContent=n;b.onclick=function(){guess.push(n);render();if(guess.length===len){attempts++;var matched=guess.filter(function(v,i){return v===secret[i];}).length;document.getElementById('lock-attempts').textContent=attempts;document.getElementById('lock-matched').textContent=matched;if(matched===len)document.getElementById('lock-hint').textContent='Unlocked! Code cracked.';else{document.getElementById('lock-hint').textContent=matched+' correct positions. Try again.';guess=[];setTimeout(render,450);}}};keys.appendChild(b);}}
    document.getElementById('lock-start').onclick=start;document.getElementById('lock-level').onchange=start;start();
  })();
});
