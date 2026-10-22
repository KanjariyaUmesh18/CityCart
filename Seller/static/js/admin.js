/* Admin-specific interactions. Demo only: no permissions, auditing or persistence. */
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',()=>{
    const {$,$$}=CC;
    // commission calculator
    const rate=$('#cm-rate');
    if(rate){const base=$('#cm-base'),calc=()=>{const g=+base.value||0,r=+rate.value||0,f=+($('#cm-fixed')||{value:0}).value||0;const c=g*r/100+f;
      $('#cm-out-fee').textContent=CC.inr(c);$('#cm-out-net').textContent=CC.inr(g-c);$('#cm-out-pct').textContent=r+'%'};
      [rate,base,$('#cm-fixed')].forEach(i=>i&&i.addEventListener('input',calc));calc()}
    // category add
    const cf=$('#catForm');
    cf&&document.addEventListener('form-ok',e=>{if(e.detail!==cf)return;const t=$('#cats tbody'),n=$('#cat-name').value,tr=document.createElement('tr');tr.dataset.status='Active';
      tr.innerHTML=`<td data-label="Order">${t.rows.length+1}</td><td data-label="Category"><div class="cell-flex"><span class="kpi-ico kpi-green" style="width:36px;height:36px"><i class="fa-solid ${$('#cat-icon').value}"></i></span><strong>${CC.esc(n)}</strong></div></td><td data-label="Products">0</td><td data-label="Status">${CC.badge('Active')}</td><td data-label="Actions"><div class="actions"><button class="btn-cc btn-outline-cc btn-sm-cc" data-toast="Edit form opens here (demo)">Edit</button></div></td>`;t.appendChild(tr);cf.reset();CC.toast('Category added (demo)')});
    // application detail drawer
    $$('[data-app]').forEach(b=>b.addEventListener('click',()=>{const d=JSON.parse(b.dataset.app);$('#appDetail').hidden=false;
      $('#ad-name').textContent=d.name;$('#ad-owner').textContent=d.owner;$('#ad-cat').textContent=d.cat;$('#ad-city').textContent=d.city;$('#ad-docs').textContent=d.docs;$('#ad-note').textContent=d.note;$('#ad-img').src=b.dataset.img;
      $('#appDetail').scrollIntoView({behavior:'smooth',block:'nearest'})}));
    // banner reorder / toggles
    $$('[data-move]').forEach(b=>b.addEventListener('click',()=>{const r=b.closest('[data-row]'),s=+b.dataset.move>0?r.nextElementSibling:r.previousElementSibling;if(!s)return;+b.dataset.move>0?s.after(r):s.before(r);CC.toast('Order changed (demo)')}));
  });
})();
