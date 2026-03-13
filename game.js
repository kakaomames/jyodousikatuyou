/* game.js - バトルロジック集約 */
let D=[], G={}, P={}, E={}, party=[];
const $=i=>document.getElementById(i), L=t=>$('msg').innerText=t;

async function init(){
    const [r1, r2] = await Promise.all([fetch('./tanngo.json'), fetch('./config.json')]);
    D = await r1.json(); G = await r2.json();
    L("最初のパートナーを選んで！");
    $('cmd').innerHTML = "";
    G.starters.forEach(s => {
        const b = document.createElement('button'); b.innerText = s.n; b.className = "atk-btn";
        b.onclick = () => { 
            let first = { ...s, ...G.player, h: G.player.hp };
            party.push(first); P = party[0]; spawn(); 
        };
        $('cmd').appendChild(b);
    });
}

function spawn(){
    E = D[Math.floor(Math.random()*D.length)]; E.h = 100;
    $('mon').innerText = "👾"; upd();
    L(`野生の ${E.n} が現れた！`); menu();
}

function upd(){
    $('eh').style.width = E.h+"%"; $('ph').style.width = (P.h/G.player.hp)*100+"%";
    $('en').innerText = E.n; $('pn').innerText = `${P.n} (Lv.${P.lv})`;
}

function menu(){
    const c = $('cmd'); c.innerHTML = "";
    c.appendChild(btn("たたかう", "atk-btn", atk));
    c.appendChild(btn("ポケモン", "ball-btn", openParty));
    c.appendChild(btn("バッグ", "ball-btn", get));
    c.appendChild(btn("にげる", "run-btn", spawn));
}

function btn(t, cl, f){
    const b = document.createElement('button'); b.innerText = t; b.className = cl; b.onclick = f; return b;
}

function openParty(){
    const scr = $('party-screen'); scr.style.display = "flex";
    const list = $('party-list'); list.innerHTML = "";
    party.forEach((m, i) => {
        const d = document.createElement('div');
        d.className = `party-slot ${m === P ? 'active-slot' : ''}`;
        d.innerHTML = `<div>${m.n} (Lv.${m.lv}) HP:${m.h}</div>`;
        const b = btn(m === P ? "戦闘中" : "入れ替える", "atk-btn", () => {
            if(m.h <= 0) { L("力尽きている！"); return; }
            P = party[i]; scr.style.display = "none"; L(`${P.n} に交代した！`); upd(); setTimeout(menu, 1000);
        });
        d.appendChild(b); list.appendChild(d);
    });
}

function atk(){
    if(P.h <= 0){ L("体力が残っていない！交代か回復が必要だ。"); return; }
    $('cmd').innerHTML = ""; L("意味を選べ！");
    const ok = E.m, cs = shf([ok, "打消", "過去", "完了"]).slice(0, 4);
    cs.forEach(v => {
        const b = btn(v, "atk-btn", () => {
            if(v === ok){ E.h -= G.balance.dmg; L("効果は ばつぐんだ！"); }
            else { P.h = Math.max(0, P.h - 20); L("反撃を受けた！"); }
            upd(); setTimeout(E.h<=0?win:menu, 1000);
        });
        $('cmd').appendChild(b);
    });
}

function win(){
    L(`${E.n} を倒した！`);
    P.exp += G.balance.exp_gain;
    if(P.exp >= P.lv * 100) { P.lv++; L("レベルアップ！"); }
    setTimeout(spawn, 1500);
}

function get(){
    L("ボールを投げた！"); $('mon').innerText = "🔴";
    setTimeout(() => {
        if(Math.random()*100 < (100-E.h)+10){
            L(`${E.n} を捕まえた！`);
            if(party.length < G.player.max_party) party.push({...E, ...G.player, h:G.player.hp});
            $('mon').innerText = "✨"; setTimeout(spawn, 1500);
        } else { L("だめだ！ボールから出てしまった！"); menu(); }
    }, 1000);
}

function shf(a){ return a.sort(() => Math.random()-0.5); }
init();
