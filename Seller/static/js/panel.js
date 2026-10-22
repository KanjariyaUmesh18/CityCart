/* Shared seller/admin panel behaviour: sidebar, tables (search/filter/paginate), image previews. Demo only. */
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',()=>{
    const {$,$$}=CC;
    const sb=$('#sidebar'),bd=$('#sideBackdrop'),tg=$('#sideToggle');
    const set=o=>{if(!sb)return;sb.classList.toggle('open',o);bd&&bd.classList.toggle('show',o);tg&&tg.setAttribute('aria-expanded',o)};
    tg&&tg.addEventListener('click',()=>set(!sb.classList.contains('open')));bd&&bd.addEventListener('click',()=>set(false));
    $$('.side-close').forEach(b=>b.addEventListener('click',()=>set(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
    // tables
    const tables={};
    $$('table.tbl[data-paged]').forEach(t=>{
      const id=t.id,per=+t.dataset.paged||8;let page=1;tables[id]=()=>{
        const q=(($(`[data-tbl-search="${id}"]`)||{}).value||'').toLowerCase(),g=((($('[data-global-search] input')||{}).value)||'').toLowerCase();
        const fs=$$(`[data-tbl-filter="${id}"]`).map(s=>s.value).filter(Boolean);
        const rows=$$('tbody tr',t);const ok=rows.filter(r=>{const tx=r.textContent.toLowerCase();return(!q||tx.includes(q))&&(!g||tx.includes(g))&&fs.every(f=>tx.includes(f.toLowerCase()))});
        const pages=Math.max(1,Math.ceil(ok.length/per));page=Math.min(page,pages);rows.forEach(r=>r.hidden=true);ok.slice((page-1)*per,page*per).forEach(r=>r.hidden=false);
        const c=$(`[data-tbl-count="${id}"]`);if(c)c.textContent=ok.length?`Showing ${(page-1)*per+1}–${Math.min(page*per,ok.length)} of ${ok.length}`:'No records';
        const e=$(`[data-tbl-empty="${id}"]`);if(e)e.classList.toggle('d-none',ok.length>0);t.closest('.tbl-wrap').hidden=!ok.length;
        const p=$(`[data-tbl-pager="${id}"]`);if(p){p.innerHTML='';if(pages>1)for(let i=1;i<=pages;i++){const li=document.createElement('li');li.className='page-item'+(i===page?' active':'');li.innerHTML=`<button class="page-link" type="button" aria-label="Page ${i}">${i}</button>`;li.firstChild.onclick=()=>{page=i;tables[id]()};p.appendChild(li)}}
      };tables[id]();
    });
    const rerun=()=>Object.values(tables).forEach(f=>f());
    $$('[data-tbl-search],[data-tbl-filter]').forEach(i=>i.addEventListener('input',()=>{rerun()}));
    const gs=$('[data-global-search] input');gs&&gs.addEventListener('input',rerun);
    $$('[data-global-search]').forEach(f=>f.addEventListener('submit',e=>e.preventDefault()));
    // image previews
    $$('input[type=file][data-preview]').forEach(i=>i.addEventListener('change',()=>{const f=i.files[0],t=document.getElementById(i.dataset.preview);if(!f||!t)return;
      if(!f.type.startsWith('image/')){CC.toast('Please choose an image file');i.value='';return}
      const r=new FileReader();r.onload=()=>{t.innerHTML=`<img src="${r.result}" alt="Preview of selected image">`;CC.toast('Preview updated (file is not uploaded in this demo)')};r.readAsDataURL(f)}));
    // multi-image product previews
    $$('input[type=file][data-multi]').forEach(i=>i.addEventListener('change',()=>{const t=document.getElementById(i.dataset.multi);t.innerHTML='';[...i.files].slice(0,5).forEach(f=>{const r=new FileReader();r.onload=()=>{const d=document.createElement('div');d.className='upload-prev';d.innerHTML=`<img src="${r.result}" alt="Selected product image">`;t.appendChild(d)};r.readAsDataURL(f)})}));
    // generic toggles (switches that explain themselves)
    $$('[data-switch-msg]').forEach(s=>s.addEventListener('change',()=>CC.toast(s.dataset.switchMsg+(s.checked?': on':': off')+' (demo)')));
  });
})();
