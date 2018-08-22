export default class BLKCC_Notary_View {

  constructor(argObj = {}) {return this instanceof BLKCC_Notary_View
    ? this.init(argObj)
    : new BLKCC_Notary_View(argObj)
  }
  
  init(argObj = {}) {
    this.navTabs = {};
    this.appViews = {};
    this.viewOffsets = {};
    Object.assign(this, argObj);
    this.container = document.querySelector(this.querySelector);
    
    for(let section of this.container.children) {this[section.tagName.toLowerCase()] = section;}
    this.nav = this.nav.querySelector('nav');
    
    for(let navTab of this.nav.children) {
      let navName = navTab.getAttribute('for');
      this.navTabs[navName] = navTab;
      navTab.addEventListener('click', ev => notary.view.render(navName));
    }
    for(let field of this.details.querySelectorAll('div')) {this[field.classList[0]] = field.lastChild;}
    
    this.initAppViews(this.form.children);
    this.form.addEventListener('submit', ev => {ev.preventDefault(); this.formSubmit(ev.explicitOriginalTarget.parentNode.name)});
    this.appViews.regFile.input.addEventListener('change', this.fileInputChange);
    this.appViews.regText.input.addEventListener('keyup', this.inputChange);
    this.stats = this.form.querySelector('.statistics');    
    
    return this.render('regFile');
  }
  
  initAppViews(appViews) {for(let viewOffset = 0, f = appViews.length; viewOffset < f; viewOffset++) {
    let view = appViews[viewOffset],
    viewName = view.name;
    this.appViews[viewName] = view;
    this.viewOffsets[viewName] = viewOffset;
    view.setAttribute('disabled', 'true');

    if(viewName.slice(0, 3) !== 'reg') {continue;}
    let inp = view.input = view.querySelector('input, textarea');
    inp.addEventListener('change', ev => notary[viewName](inp));
    if(inp.preview = view.querySelector('input[placeholder=hash]')) {inp.preview.addEventListener('click', this.copyHash);}
  }}
  
  formSubmit(viewName) {
    const reg = viewName.slice(0, 3) === 'reg',
    inp = this.appViews[viewName].input;
    this.notary[reg? 'submitHash' : viewName]((inp.preview || inp).value);
  }
  
  inputChange(ev) {notary[ev.target.name](ev.target);}
  
  copyHash(ev) {
    const tar = ev.target;
    tar.select();
    document.execCommand('copy');
    tar.title = 'Copied to clipboard';
    setTimeout(() => tar.title = '', 5000);
  }
  
  fileInputChange(ev) {
    let tar = ev.target;
    tar.previousElementSibling.textContent = tar.value.slice(tar.value.lastIndexOf('\\') + 1);
  }
  
  verHashUpd() {
    if(this.notary.errorLocks.login) {return this.stats.innerHTML = 'Not logged into <a href="https://metamask.io/" target="_blank">Metamask</a>';}
    this.notary.web3js.eth.getTransactionCount(this.notary.account, (err, res) => {
      if(err) {throw err;}
      this.stats.textContent = `Total account transactions: ${res}`;
    });
  }
  
  render(view) {
    if('curr' in this) {this.showView(this.curr, false);}
    this.showView(this.curr = view);
    this.form.style.left = `-${this.viewOffsets[view]}00%`;
    if((view = `${view}Upd`) in this) {this[view]();}
    return this;
  }
  showView(viewName, show = true) {
    if(viewName in this.navTabs) {this.navTabs[viewName].classList[show ? 'add' : 'remove']('selected');}
    this.appViews[viewName][`${show ? 'remove' : 'set'}Attribute`]('disabled', 'true');
  }
  showResult(res = 'Results') {
    this.appViews.results.innerHTML = res;
    return this.render('results');
  }
  
  error(err) {
    const el = document.createElement('figure'),
    btn = el.appendChild(document.createElement('button'));
    el.appendChild(document.createElement('span'))
    .innerHTML = err.lineno
      ? `<pre>${err.message}\n@ ${err.filename}:${err.lineno}:${err.colno}</pre>`
      : err;
    btn.innerText = 'dismiss';
    btn.addEventListener('click', this.dismissErr);
    return this.aside.appendChild(el);
  }
  dismissErr(ev) {
    const tar = ev.target.parentNode;
    tar.parentNode.removeChild(tar);
  }
  
  setInfo(prop, val) {return this[prop].innerHTML = val;}

};
