/* game.js - バトルロジック集約 */
let D=[], G={}, P={}, E={}, party=[]; 
const $=i=>document.getElementById(i), L=t=>$('msg').innerText=t;

async function init(){
    const [r1,r2]=await Promise.all([fetch('./tanngo.json'),fetch('./config.json')]);
    D=await r1.json(); G=await r2.json();
    L("最初のパートナーを選んで！");
    $('cmd').innerHTML="";
    G.starters.forEach(s=>{
        const b=document.createElement('button'); b.innerText=s.n; b.className="atk-btn";
        b.onclick=()=>{ 
            P = {...s, ...G.player, h: G.player.hp}; // 初期HPセット
            party = [P]; // 手持ちに追加
            spawn(); 
        };
        $('cmd').appendChild(b);
    });
}

// ... spawn, upd, menu, atk, get, shf などの関数をここに並べる ...

function spawn(){
    if(P.h <= 0) { L("力尽きている... やすんで回復だ！"); menu(); return; }
    E = D[Math.floor(Math.random()*D.length)]; E.h=100;
    $('mon').innerText="👾"; upd();
    L(`野生の ${E.n} が現れた！`); menu();
}

// 最後に実行
init();
