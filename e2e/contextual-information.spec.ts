/**
 * Real-API regression coverage for FR-020 filters and FR-059 information.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { test, expect, type Page, type Locator } from '@playwright/test';
import { signUp, uniqueEmail } from './helpers.ts';
const API='http://localhost:8080/api/v1';
const modules=[['DASHBOARD','Dashboard','/dashboard'],['MOVIMIENTOS','Movimientos','/movimientos'],['CUENTAS','Cuentas','/cuentas'],['TARJETAS','Tarjetas','/tarjetas'],['PAGOS FIJOS','Pagos fijos','/pagos-fijos'],['PRESUPUESTO','Presupuesto','/presupuesto'],['FLUJO DE CAJA','Flujo de caja','/flujo-de-caja'],['METAS','Metas','/metas'],['REPORTES','Reportes','/reportes'],['CALENDARIO','Calendario','/calendario']];
const cases=modules.map(([module,topic,route])=>({module,title:`Ayuda Informativa - Ok - ${topic} conserva su contexto`,route,topics:[topic],kind:'help'}));
cases.push(
 {module:'DASHBOARD',title:'Ayudas de Indicadores - Ok - Saldo deuda y posición neta',route:'/dashboard',topics:['Saldo en cuentas','Deuda de tarjetas','Posición neta'],kind:'help'},
 {module:'DASHBOARD',title:'Ayudas de Indicadores - Ok - Ingresos salidas y compromisos',route:'/dashboard',topics:['Ingresos','Salidas','Compromisos'],kind:'help'},
 {module:'DASHBOARD',title:'Ayudas sin Datos - Ok - Indicadores alineados y ayudas disponibles',route:'/dashboard',topics:['Saldo en cuentas'],kind:'empty-dashboard'},
 {module:'MOVIMIENTOS',title:'Tipo de Ingreso - Ok - Explicación conserva los datos del formulario',route:'/movimientos/nuevo?tipo=ingreso',topics:['Tipo de ingreso'],kind:'income-form'},
 {module:'REPORTES',title:'Tipo de Ingreso - Ok - Explicación conserva los filtros del reporte',route:'/reportes',topics:['Tipo de ingreso'],kind:'income-report'},
 {module:'TARJETAS',title:'Ayuda de Pago - Ok - Consultar explicación no modifica la facturación',route:'/tarjetas',topics:['Pago de tarjeta'],kind:'card'},
 ...['Activas por defecto','Alternar filtros conserva los saldos','Estado vacío sin cuentas activas','Estado vacío sin cuentas desactivadas','Detalle desactivado retorna al filtro de origen','Desactivar conserva saldo e historial','Cuenta desactivada no se ofrece en nuevos registros'].map((title,i)=>({module:'CUENTAS',title:`Filtro de Cuentas - ${i===6?'NO Ok':'Ok'} - ${title}`,route:'/cuentas',topics:[],kind:`accounts-${i}`}))
);
async function post(page:Page,path:string,data:unknown){const r=await page.request.post(API+path,{data});expect(r.ok(),`${path}: ${await r.text()}`).toBeTruthy();return r.json();}
for(const [index,c] of cases.entries()) test(c.title,async({page},info)=>{
 test.setTimeout(60000);
 await signUp(page,uniqueEmail(`help-${index}`)); await page.getByRole('button',{name:'Omitir por ahora'}).click();
 const shot=async(target:Locator,shows?:string)=>{await expect(target).toBeVisible();if(shows)await expect(target).toContainText(shows);};
 let route=c.route;
 if(c.kind==='income-report'){
  const cats=await (await page.request.get(API+'/categories?nature=INCOME')).json();
  await post(page,'/transactions',{nature:'INCOME',amount:100,currency:'PEN',categoryId:cats[0].id,economicDate:'2026-11-10'});
 }
 if(c.kind==='card'){
  const card=await post(page,'/cards',{name:'Tarjeta de prueba',currency:'PEN',bankId:null,customBankName:'Banco de prueba',creditLine:1000,billingDate:'2026-11-20',paymentDueDate:'2026-12-05',color:'#3333b2',openingDebts:[]});route=`/tarjetas/${card.id}`;
 }
 if(c.kind.startsWith('accounts-')){
  const i=Number(c.kind.slice(-1));
  const account=await post(page,'/accounts',{alias:'Cuenta de prueba',type:'CASH',currency:'PEN',openingBalance:1000,openingBalanceAsOf:'2026-11-10'});
  if([0,1,4,6].includes(i)) await post(page,'/accounts',{alias:'Otra cuenta activa',type:'CASH',currency:'USD',openingBalance:20,openingBalanceAsOf:'2026-11-10'});
  if([0,1,2,4,6].includes(i))await post(page,`/accounts/${account.id}/deactivations`,{});
  if(i===5){const cats=await (await page.request.get(API+'/categories?nature=EXPENSE')).json();await post(page,'/transactions',{nature:'EXPENSE',amount:20,currency:'PEN',categoryId:cats[0].id,economicDate:'2026-11-10',paymentMethodKind:'ACCOUNT',instrumentId:account.id});}
  await page.goto(route);
  const active=page.getByRole('button',{name:'Activas',exact:true}),inactive=page.getByRole('button',{name:'Desactivadas',exact:true});
  await expect(active).toHaveAttribute('aria-pressed','true');
  if(i===0){await shot(active);await expect(page.getByText('Cuenta de prueba',{exact:true})).toHaveCount(0);await shot(page.locator('main'),'Otra cuenta activa');}
  if(i===1){await shot(inactive);await inactive.click();await expect(page.getByText('Cuenta de prueba',{exact:true})).toBeVisible();await shot(page.locator('main'),'S/ 1,000.00');await active.click();await expect(page.getByText('Cuenta de prueba',{exact:true})).toHaveCount(0);}
  if(i===2){await shot(active);await expect(page.getByText('No tienes cuentas activas',{exact:true})).toBeVisible();await shot(page.locator('main'),'No tienes cuentas activas');}
  if(i===3){await shot(inactive);await inactive.click();await expect(page.getByText('No tienes cuentas desactivadas',{exact:true})).toBeVisible();await shot(page.locator('main'),'No tienes cuentas desactivadas');}
  if(i===4){await inactive.click();await page.getByText('Cuenta de prueba',{exact:true}).click();const back=page.getByRole('button',{name:'Volver',exact:true});await shot(back);await back.click();await expect(inactive).toHaveAttribute('aria-pressed','true');await shot(page.locator('main'),'Cuenta de prueba');}
  if(i===5){await page.getByText('Cuenta de prueba',{exact:true}).click();await page.getByRole('button',{name:'Desactivar',exact:true}).click();const dialog=page.getByRole('dialog');await shot(dialog.getByRole('button',{name:'Desactivar cuenta',exact:true}));await dialog.getByRole('button',{name:'Desactivar cuenta',exact:true}).click();await inactive.click();await expect(page.getByText('Cuenta de prueba',{exact:true})).toBeVisible();await shot(page.locator('main'),'S/ 980.00');const history=await (await page.request.get(API+`/transactions?instrumentId=${account.id}`)).json();expect(history.totalElements).toBe(1);}
  if(i===6){await shot(inactive);await page.goto('/transferencias/nueva');await expect(page.getByText('Cuenta de prueba',{exact:true})).toHaveCount(0);await shot(page.locator('main'));}
  const current=await (await page.request.get(API+`/accounts/${account.id}`)).json();expect(Number(current.openingBalance)).toBe(1000);
 }else{
  await page.goto(route);
  if(c.kind==='income-report')await page.getByRole('button',{name:'Ingresos',exact:true}).click();
  if(c.kind==='income-form')await page.getByLabel('Importe',{exact:true}).fill('321');
  if(c.kind==='empty-dashboard'){
   await expect(page.locator('[data-stat-card]')).toHaveCount(6);
   const boxes=await page.locator('[data-stat-value]').evaluateAll(es=>es.map(e=>({y:e.getBoundingClientRect().y,h:e.closest('[data-stat-card]')!.getBoundingClientRect().height})));
   for(let j=0;j<boxes.length-1;j+=info.project.name==='desktop'?3:2){expect(Math.abs(boxes[j].y-boxes[j+1].y)).toBeLessThanOrEqual(1);expect(Math.abs(boxes[j].h-boxes[j+1].h)).toBeLessThanOrEqual(1);}
  }
  for(const topic of c.topics){
   const trigger=page.getByRole('button',{name:`Información sobre ${topic}`,exact:true}).filter({visible:true});
   await expect(trigger).toBeVisible();await shot(trigger);
   const before=page.url();await trigger.click();const panel=page.getByRole('dialog',{name:topic,exact:true});await expect(panel).toBeVisible();
   expect(await panel.evaluate(e=>getComputedStyle(e.parentElement!).backgroundColor)).toBe('rgba(26, 26, 26, 0.35)');await expect(panel.locator('p')).not.toBeEmpty();await shot(panel,topic);
   const box=await panel.boundingBox();expect(box).not.toBeNull();if(info.project.name==='desktop')expect(box!.width).toBe(480);else expect(Math.abs(box!.y+box!.height-874)).toBeLessThanOrEqual(1);
   await panel.getByRole('button',{name:'Cerrar',exact:true}).click();await expect(panel).toBeHidden();expect(page.url()).toBe(before);await expect(trigger).toBeFocused();
  }
  if(c.kind==='income-form')await expect(page.getByLabel('Importe',{exact:true})).toHaveValue('321');
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
