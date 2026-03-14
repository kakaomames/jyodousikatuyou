/* game.js - Gemini programming隊 モジュール化パッチ */
let D=[], G={}, P={}, E={}, party=[];
const $=i=>document.getElementById(i), L=t=>$('msg').innerText=t;

// --- 1. 初期化ユニット ---
/* --- 初期化フローの改造 --- */
async function init(){
    const [r1, r2] = await Promise.all([fetch('./tanngo.json'), fetch('./config.json')]);
    D = await r1.json(); G = await r2.json();
    
    // タイトル画面の準備
    showTitle();
}

function showTitle() {
    const area = $('start-btn-area');
    area.innerHTML = "";
    L("最初のパートナーを選んで 調査を開始せよ！");
    
    G.starters.forEach(s => {
        const b = btn(`${s.n} と出発`, "atk-btn", () => { 
            P = { ...s, ...G.player, h: G.player.hp };
            party.push(P);
            // タイトルを消してバトル開始
            $('title-screen').style.display = "none";
            spawn(); 
        });
        b.style.margin = "10px";
        area.appendChild(b);
    });
}

// --- 2. バトル管理ユニット ---
function spawn(){
    E = D[Math.floor(Math.random()*D.length)]; E.h = 100;
    $('mon').innerText = "👾"; upd();
    L(`野生の ${E.n} が飛び出してきた！`); menu();
}

function upd(){
    $('eh').style.width = E.h+"%"; 
    $('ph').style.width = (P.h/G.player.hp)*100+"%";
    $('en').innerText = E.n; 
    $('pn').innerText = `${P.n} (Lv.${P.lv})`;
}

function menu(){
    const c = $('cmd'); c.innerHTML = "";
    c.appendChild(btn("たたかう", "atk-btn", atk));
    c.appendChild(btn("キャンプ", "rest-btn", startCamp));
    c.appendChild(btn("ポケモン", "ball-btn", openParty));
    c.appendChild(btn("バッグ", "run-btn", get));
}

// --- 3. アクション関数集 ---
function atk(){
    if(!checkStatus()) return;
    $('cmd').innerHTML = ""; L(`${E.n}を解析中...意味は？`);
    const ok = E.m, cs = shf([ok, "打消", "過去", "完了"]).slice(0, 4);
    cs.forEach(v => {
        $('cmd').appendChild(btn(v, "atk-btn", () => {
            if(v === ok){ 
                E.h -= G.balance.dmg; effect('flash'); L("効果は ばつぐんだ！"); 
            } else { 
                P.h = Math.max(0, P.h - 20); effect('shake'); L("解析失敗！反撃を受けた！"); 
            }
            upd(); setTimeout(E.h<=0 ? showResult : (P.h<=0 ? checkStatus : menu), 1000);
        }));
    });
}

function get(){
    L("ボールを投げた！"); $('mon').innerText = "🔴";
    setTimeout(() => {
        if(Math.random()*100 < (100-E.h)+10){
            L(`${E.n} を捕まえた！`);
            if(party.length < G.player.max_party) party.push({...E, ...G.player, h:G.player.hp});
            $('mon').innerText = "✨"; showResult();
        } else { L("だめだ！"); menu(); }
    }, 1000);
}

// --- 4. 拡張機能ユニット ---
function startCamp() {
    $('cmd').innerHTML = ""; L("キャンプ中...");
    setTimeout(() => {
        party.forEach(m => m.h = G.player.hp);
        L("みんな カレーを食べて 全快した！"); upd();
        setTimeout(menu, 1500);
    }, 1000);
}

function openParty(){
    const scr = $('party-screen'); scr.style.display = "flex";
    const list = $('party-list'); list.innerHTML = "";
    party.forEach((m, i) => {
        const d = document.createElement('div');
        d.className = `party-slot ${m === P ? 'active-slot' : ''}`;
        d.innerHTML = `<div>${m.n} (Lv.${m.lv}) HP:${m.h}</div>`;
        d.appendChild(btn(m === P ? "戦闘中" : "入れ替える", "atk-btn", () => {
            if(m.h <= 0) return L("力尽きている！");
            P = party[i]; scr.style.display = "none"; upd(); menu();
        }));
        list.appendChild(d);
    });
}

function showResult() {
    L(`${E.n} の調査完了！ 経験値獲得！`);
    P.exp += G.balance.exp_gain;
    if(P.exp >= P.lv * 100) {
        P.exp = 0; P.lv++; P.h = G.player.hp;
        L(`レベルアップ！ Lv.${P.lv} になり 全快した！`);
    }
    setTimeout(spawn, 1500);
}

function checkStatus() {
    if (P.h <= 0) {
        L(`${P.n} は力尽きた！交代してくれ！`);
        setTimeout(openParty, 1000); return false;
    } return true;
}

// --- 5. ユーティリティ ---
function btn(t, cl, f){
    const b = document.createElement('button'); b.innerText = t; b.className = cl; b.onclick = f; return b;
}
function shf(a){ return a.sort(() => Math.random()-0.5); }
function effect(type){
    const f = $('field'); f.style.animation = type==='shake'?'shake 0.3s':'flash 0.1s';
    setTimeout(()=>f.style.animation='', 300);
}

init();
