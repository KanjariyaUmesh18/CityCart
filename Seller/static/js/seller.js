/* Seller-specific interactions. Demo only: nothing is saved to a server. */
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',()=>{
    const {$,$$,inr}=CC;
    // product form: live price/discount, variant rows, character count
    const price=$('#pf-price'),cmp=$('#pf-compare'),out=$('#pf-disc');
    const calc=()=>{if(!out)return;const p=+price.value,c=+cmp.value;out.textContent=c&&p&&c>p?`Shows as ${Math.round((c-p)*100/c)}% off. Use a comparison price only if it is a real previous or MRP price.`:(c&&c<=p?'Comparison price must be higher than the selling price.':'No discount badge will be shown.');out.className='form-text '+(c&&c<=p?'text-danger':'')};
    price&&[price,cmp].forEach(i=>i.addEventListener('input',calc));calc();
    const add=$('#addVariant');
    add&&add.addEventListener('click',()=>{const t=$('#variantRows');const d=document.createElement('div');d.className='row g-2 mb-2 align-items-end';
      d.innerHTML='<div class="col-5"><input class="form-control form-control-sm" placeholder="Option (e.g. Size M)" aria-label="Option name"></div><div class="col-3"><input class="form-control form-control-sm" type="number" min="0" placeholder="Stock" aria-label="Stock"></div><div class="col-3"><input class="form-control form-control-sm" type="number" min="0" placeholder="Price" aria-label="Price"></div><div class="col-1"><button type="button" class="btn btn-sm text-danger" aria-label="Remove option"><i class="fa-regular fa-trash-can"></i></button></div>';
      d.querySelector('button').onclick=()=>d.remove();t.appendChild(d)});
    const desc=$('#pf-desc'),cnt=$('#pf-count');desc&&cnt&&desc.addEventListener('input',()=>cnt.textContent=desc.value.length+'/600');
    // inventory steppers
    $$('[data-inv]').forEach(row=>{const inp=$('input',row),low=+row.dataset.low||5;
      const paint=()=>{const v=+inp.value;const b=$('[data-st]',row);const st=v===0?'Out of stock':v<=low?'Low stock':'In stock';
        if(b){b.outerHTML=CC.badge(st==='Low stock'?'Pending':st).replace(/Pending/,'Low stock')}row.classList.toggle('table-warning',v>0&&v<=low)};
      $$('[data-step]',row).forEach(b=>b.onclick=()=>{inp.value=Math.max(0,+inp.value+ +b.dataset.step);paint()});inp.addEventListener('input',paint)});
    $$('[data-save-stock]').forEach(b=>b.onclick=()=>CC.toast('Stock saved (demo – not stored)'));
    // order status actions
    $$('[data-advance]').forEach(b=>b.addEventListener('click',()=>{const tr=b.closest('tr,.status-scope');const nb=tr&&tr.querySelector('[data-st]');if(nb){nb.outerHTML=CC.badge(b.dataset.advance)}
      CC.toast('Order marked '+b.dataset.advance+' (demo)');if(b.dataset.last!==undefined)b.remove()}));
    // shop setup stepper
    const steps=$$('[data-step-pane]');let cur=0;
    const show=n=>{cur=n;steps.forEach((s,i)=>s.hidden=i!==n);$$('.stepper span').forEach((s,i)=>{s.classList.toggle('on',i<=n);s.setAttribute('aria-current',i===n?'step':'false')});window.scrollTo({top:0,behavior:"smooth"});const fin=$("#finish");if(fin){fin.classList.toggle("d-none",n!==steps.length-1);$$("[data-next-step]").forEach(b=>b.classList.toggle("d-none",n===steps.length-1))}};
    if(steps.length){show(0);$$('[data-next-step]').forEach(b=>b.onclick=()=>{const f=steps[cur];let ok=true;$$('[required]',f).forEach(i=>{const bad=!i.checkValidity();i.classList.toggle('is-invalid',bad);if(bad)ok=false});if(ok)show(Math.min(cur+1,steps.length-1));else CC.toast('Please complete the required fields')});$$('[data-prev-step]').forEach(b=>b.onclick=()=>show(Math.max(cur-1,0)))}
    // verification demo state switcher
    const vs=$$('[data-vstate]');vs.forEach(b=>b.onclick=()=>{vs.forEach(x=>x.setAttribute('aria-pressed',x===b));$$('[data-vpane]').forEach(p=>p.hidden=p.dataset.vpane!==b.dataset.vstate)});
    vs.length&&vs[0].click();
  });
})();
