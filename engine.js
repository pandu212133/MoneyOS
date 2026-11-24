/* FinEngine 0.2: deterministic monthly reducing-balance model, integer paise. */
(function(root){'use strict';
function simulate(debts,budget,mode='Avalanche',horizon=360){
 if(!Number.isSafeInteger(budget)||budget<0||!Number.isInteger(horizon)||horizon<1||horizon>360)throw Error('Invalid analysis settings');
 let ds=debts.map(d=>{if(!Number.isSafeInteger(d.value)||d.value<0||!Number.isFinite(d.apr)||d.apr<0||d.apr>100||!Number.isSafeInteger(d.minimum)||d.minimum<0||!Number.isFinite(d.fee)||d.fee<0||d.fee>100)throw Error('Complete all debt terms');return {...d,b:d.value}}),interest=0,fees=0,rows=[],initial=ds.reduce((s,d)=>s+d.b,0);
 for(let m=1;m<=horizon&&ds.some(d=>d.b>0);m++){
 let payments=[];for(const d of ds){let i=Math.round(d.b*d.apr/1200);d.b+=i;interest+=i;payments.push({id:d.id,name:d.name,interest:i,paid:Math.min(d.b,d.minimum),extra:0,fee:0});}
 let required=payments.reduce((s,p)=>s+p.paid,0);if(required>budget)return {mode,status:'shortfall',month:m,shortfall:required-budget,interest,fees,rows,remaining:ds.reduce((s,d)=>s+d.b,0)};
 let left=budget-required;ds.forEach((d,i)=>d.b-=payments[i].paid);
 let order=ds.map((d,i)=>({d,i})).filter(x=>x.d.b>0&&!x.d.blocked).sort((a,b)=>Array.isArray(mode)?mode.indexOf(a.d.id)-mode.indexOf(b.d.id):mode==='Snowball'?a.d.b-b.d.b:mode==='Largest'?b.d.b-a.d.b:mode==='Fee-aware'?(b.d.apr-b.d.fee*12)-(a.d.apr-a.d.fee*12):mode==='Minimum only'?0:b.d.apr-a.d.apr);
 if(mode!=='Minimum only')for(const {d,i} of order){let p=Math.min(d.b,Math.floor(left/(1+d.fee/100)));let f=Math.round(p*d.fee/100);if(p+f>left){p=Math.max(0,p-1);f=Math.round(p*d.fee/100)}d.b-=p;left-=p+f;fees+=f;payments[i].extra=p;payments[i].fee=f;}
 rows.push({month:m,remaining:ds.reduce((s,d)=>s+d.b,0),payments,unused:left});
 }
 let remaining=ds.reduce((s,d)=>s+d.b,0);return {mode,status:remaining?'horizon':'paid',month:rows.length,interest,fees,remaining,initial,rows};
}
function compare(debts,budget,horizon){return ['Avalanche','Snowball','Largest','Fee-aware','Minimum only'].map(m=>simulate(debts,budget,m,horizon)).sort((a,b)=>(a.status==='paid'?0:1)-(b.status==='paid'?0:1)||(a.status==='paid'?(a.interest+a.fees)-(b.interest+b.fees):a.remaining-b.remaining)||a.month-b.month)}
const api={simulate,compare};if(typeof module!=='undefined')module.exports=api;else root.FinEngine=api;
})(globalThis);
