(function(root){'use strict';
const E=typeof module!=='undefined'?require('./engine'):root.FinEngine;
function lab(debts,{income,expenses,cash,reserve,bonus=0,shock=20,horizon=120}){
 for(const v of [income,expenses,cash,reserve,bonus])if(!Number.isSafeInteger(v)||v<0)throw Error('Invalid money input');
 if(!Number.isFinite(shock)||shock<0||shock>100)throw Error('Invalid shock');
 const budget=Math.max(0,income-expenses),available=Math.max(0,cash+bonus-reserve),gap=Math.max(0,reserve-cash-bonus);
 const scenarios=[['Base',budget,0],['Income shock',Math.max(0,Math.round(income*(1-shock/100))-expenses),0],['Rate shock',budget,2],['Combined shock',Math.max(0,Math.round(income*(1-shock/100))-expenses),2]];
 const stress=scenarios.map(([name,b,r])=>({name,budget:b,...E.simulate(debts.map(d=>({...d,apr:Math.min(100,d.apr+r)})),b,'Avalanche',horizon)}));
 const baseline=E.compare(debts,budget,horizon)[0];
 const moves=[{name:'Keep cash',spent:0,result:baseline}];
 if(!gap&&baseline.status!=='shortfall'&&income>=expenses)for(const d of debts.filter(d=>!d.blocked&&d.value>0)){
 let p=Math.min(d.value,Math.floor(available/(1+d.fee/100)));while(p>0&&p+Math.round(p*d.fee/100)>available)p--;if(!p)continue;
 let fee=Math.round(p*d.fee/100),result=E.compare(debts.map(x=>({...x,value:x.value-(x.id===d.id?p:0)})),budget,horizon)[0];moves.push({name:d.name,spent:p+fee,principal:p,fee,result});}
 const rank=x=>x.result.status==='paid'?0:x.result.status==='horizon'?1:2;
 moves.sort((a,b)=>rank(a)-rank(b)||(rank(a)===0?a.result.interest+a.result.fees+(a.fee||0)-b.result.interest-b.result.fees-(b.fee||0):a.result.remaining-b.result.remaining)||a.spent-b.spent);
 return {budget,available,gap,stress,moves,baseline,deficit:Math.max(0,expenses-income)};
}
const api={lab};if(typeof module!=='undefined')module.exports=api;else root.FinPro=api;
})(globalThis);
