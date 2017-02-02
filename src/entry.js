import init from './'

console.log(process.ammoPath);

init(document.getElementById('app'), { ammoPath: process.ammoPath });
