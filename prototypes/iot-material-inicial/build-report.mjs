import { copyFileSync } from 'node:fs';
// Copia el informe vigente a la ubicacion del material inicial.
copyFileSync(new URL('../../informe.html', import.meta.url), new URL('./informe.html', import.meta.url));
console.log('Informe actualizado desde la copia principal.');
