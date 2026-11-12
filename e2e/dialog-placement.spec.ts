/**
 * Regression checks for mobile sheet anchoring and desktop dialog centering.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import {test,expect,type Locator,type Page} from '@playwright/test';
import {signUp,uniqueEmail} from './helpers.ts';
const API='http://localhost:8080/api/v1';
async function checkPlacement(page:Page,dialog:Locator,mobile:boolean){
 await expect(dialog).toBeVisible();const box=await dialog.boundingBox();const viewport=page.viewportSize();
 expect(box).not.toBeNull();expect(viewport).not.toBeNull();
 if(!box||!viewport)throw new Error('Missing dialog bounds');
 expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(viewport.height+1);
 if(mobile)expect(Math.abs(box.y+box.height-viewport.height)).toBeLessThanOrEqual(1);
 else expect(Math.abs(box.y+box.height/2-viewport.height/2)).toBeLessThanOrEqual(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
}
test('payment without usual means, card payment and budget copy use the correct dialog placement',async({page},info)=>{
 test.setTimeout(60000);
 await signUp(page,uniqueEmail('sheet-placement'));await page.getByRole('button',{name:'Omitir por ahora'}).click();
 const account=await page.request.post(API+'/accounts',{data:{alias:'Ahorro USD',type:'CASH',currency:'USD',openingBalance:500,openingBalanceAsOf:'2026-11-10'}});expect(account.ok()).toBeTruthy();
 await page.goto('/pagos-fijos/nuevo');await page.getByLabel('Descripción',{exact:true}).fill('Netflix');
 await page.getByLabel('Categoría de gasto para el presupuesto',{exact:true}).selectOption({label:'Servicios'});await page.getByLabel('Moneda',{exact:true}).selectOption('USD');await page.getByLabel('Monto mensual',{exact:true}).fill('34.90');await page.getByLabel('Día de cobro',{exact:true}).fill('14');
 await page.getByRole('button',{name:'Guardar pago fijo',exact:true}).click();await page.getByRole('button',{name:/Netflix/}).first().click();
 const settle=page.getByRole('dialog',{name:'Confirmar pago de Netflix',exact:true});await checkPlacement(page,settle,info.project.name==='mobile');await expect(settle.getByRole('button',{name:'Confirmar pago',exact:true})).toBeDisabled();await settle.getByRole('button',{name:'Cancelar',exact:true}).click();
 const response=await page.request.post(API+'/cards',{data:{name:'Tarjeta de prueba',currency:'USD',bankId:null,customBankName:'Banco de prueba',creditLine:1000,billingDate:'2026-11-20',paymentDueDate:'2026-12-05',color:'#3333b2',openingDebts:[{amount:100,closingDate:'2026-10-20',paymentDueDate:'2026-11-05'}]}});expect(response.ok(),await response.text()).toBeTruthy();const card=await response.json();
 await page.goto('/tarjetas/'+card.id);await page.getByRole('button',{name:'Pagar tarjeta',exact:true}).click();const pay=page.getByRole('dialog');await checkPlacement(page,pay,info.project.name==='mobile');await pay.getByRole('button',{name:'Cancelar',exact:true}).click();
 await page.goto('/presupuesto');await page.getByRole('button',{name:'Copiar límites',exact:true}).first().click();const copy=page.getByRole('dialog',{name:'Copiar límites de otro mes',exact:true});await checkPlacement(page,copy,info.project.name==='mobile');await expect(copy.getByRole('button',{name:'Cancelar',exact:true})).toBeVisible();
});
