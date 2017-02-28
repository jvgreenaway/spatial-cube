import init from './'

// console.log(process.ammoPath);

const url = (path) => `${location.protocol}//${location.hostname}${location.port ? ':'+location.port : ''}/${path}`;

init(document.getElementById('app'), { ammoPath: url(process.ammoPath) });
