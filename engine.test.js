const assert=require('node:assert/strict'),{simulate,compare}=require('./engine');
const d=(id,value,apr,minimum,fee=0,blocked=false)=>({id,name:id,value,apr,minimum,fee,blocked});
assert.equal(simulate([d('a',10000,0,1000)],3000).month,4);
assert.equal(simulate([d('a',10000,12,1000)],1000,'Avalanche',1).remaining,9100);
assert.equal(simulate([d('a',10000,0,2000)],1000).status,'shortfall');
assert.equal(simulate([d('a',10000,0,1000,0,true)],5000).month,10);
assert.equal(simulate([d('a',10000,0,1000,10)],2100,'Avalanche',1).fees,100);
assert.equal(simulate([d('a',10000,0,0)],0,'Avalanche',12).status,'horizon');
assert.throws(()=>simulate([{value:100}],100));
assert.equal(compare([d('a',100000,36,1000),d('b',100000,5,1000)],10000,120)[0].mode,'Avalanche');
for(let i=1;i<=100;i++){let budget=1000+i*100, r=simulate([d('a',100000,12,500,3),d('b',50000,20,500)],budget);for(const row of r.rows){assert(row.remaining>=0);assert.equal(row.payments.reduce((s,p)=>s+p.paid+p.extra+p.fee,0)+row.unused,budget)}}
console.log('8 assertions and 100 generated budget-conservation cases passed');
