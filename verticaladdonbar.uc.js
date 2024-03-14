// 'Vertical Add-on Bar' script for Firefox by Aris
//
// no 'close' button
// 'toggle' toolbar with 'Ctr + Alt + /' on Windows/Linux or 'Cmd + Alt + /' on macOS
// optional toggle button hides the toolbar temporarily, it gets restored on every restart
// 'Vertical Add-on Bar' entry is only visible in toolbars context menu when in customizing mode
//
// flexible spaces on toolbar work 'vertically'
// toolbar can be on the left or on the right
// toolbar is display horizontally in customizing mode


Components.utils.import("resource:///modules/CustomizableUI.jsm");
ChromeUtils.importESModule("resource:///modules/CustomizableUI.sys.mjs");


var VerticalAddonbar = {
  init: function() {

	if (location != 'chrome://browser/content/browser.xhtml')
      return;

	/* blank tab workaround */
	try {
	  if(gBrowser.selectedBrowser.getAttribute('blank')) gBrowser.selectedBrowser.removeAttribute('blank');
	} catch(e) {}
	  
	var v_addonbar_label = 'Vertical Add-on Bar2'; // toolbar name
	var button_label = 'Toggle vertical Add-on Bar2'; // Toggle button name
	var v_addonbar_togglebutton = true; // display toggle button for vertical toolbar (true) or not (false)
	var v_addonbar_on_the_left = true; // display vertical toolbar on the left (true) or the right (false)
	var style_v_addonbar = true; // apply default toolbar appearance/colors to vertical add-on bar
	var v_addonbar_width = '30px'; // toolbar width
	var compact_buttons = false; // compact button size (true) or default button size (false)

	try {
	 if(document.getElementById('toolbox_vab') == null && document.getElementById('v_addonbar') == null) {
	  var toolbox_vab = document.createXULElement('toolbox');
	  toolbox_vab.setAttribute('orient','horizontal');
	  toolbox_vab.setAttribute('id','toolbox_vab');
	  toolbox_vab.setAttribute('insertbefore','sidebar-box');
	  
	  var tb_Vaddonbar = document.createXULElement('toolbar');
	  tb_Vaddonbar.setAttribute('id','v_addonbar');
	  tb_Vaddonbar.setAttribute('customizable','true');
	  tb_Vaddonbar.setAttribute('class','toolbar-primary chromeclass-toolbar browser-toolbar customization-target');
	  tb_Vaddonbar.setAttribute('mode','icons');
	  tb_Vaddonbar.setAttribute('iconsize','small');
	  tb_Vaddonbar.setAttribute('toolboxid','navigator-toolbox');
	  tb_Vaddonbar.setAttribute('orient','vertical');
	  tb_Vaddonbar.setAttribute('flex','1');
	  tb_Vaddonbar.setAttribute('context','toolbar-context-menu');
	  tb_Vaddonbar.setAttribute('toolbarname', v_addonbar_label);
	  tb_Vaddonbar.setAttribute('label', v_addonbar_label);
	  tb_Vaddonbar.setAttribute('lockiconsize','true');
	  tb_Vaddonbar.setAttribute('defaultset','spring');
	  
	  toolbox_vab.appendChild(tb_Vaddonbar);
	  
	  CustomizableUI.registerArea('v_addonbar', {legacy: true});
	  CustomizableUI.registerToolbarNode(tb_Vaddonbar);
	  
	  if(v_addonbar_on_the_left) {
	    document.getElementById('browser').insertBefore(toolbox_vab,document.getElementById('browser').firstChild);
	  }
	  else {
		document.getElementById('browser').appendChild(toolbox_vab);
	  }
	  
  	  var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
		  try {
			if(document.querySelector('#main-window').getAttribute('customizing')) {
			  document.querySelector('#v_addonbar').setAttribute('orient','horizontal');
			  document.querySelector('#navigator-toolbox').appendChild(document.querySelector('#v_addonbar'));
			}
			else  {
			  document.querySelector('#v_addonbar').setAttribute('orient','vertical');
			  document.querySelector('#toolbox_vab').appendChild(document.querySelector('#v_addonbar'));

			}
		  } catch(e){}
		});    
	  });
	
	  observer.observe(document.querySelector('#main-window'), { attributes: true, attributeFilter: ['customizing'] });
	  
	  try {
		Services.prefs.getDefaultBranch('browser.vaddonbar.').setBoolPref('enabled',true);
		setToolbarVisibility(document.getElementById('v_addonbar'), Services.prefs.getBranch('browser.vaddonbar.').getBoolPref('enabled'));
		setToolbarVisibility(document.getElementById('toolbox_vab'), Services.prefs.getBranch('browser.vaddonbar.').getBoolPref('enabled'));
	  } catch(e) {}
	  
	  if(v_addonbar_togglebutton) {
	  
		CustomizableUI.createWidget({
			id: 'togglebutton_v_addonbar', // button id
			defaultArea: CustomizableUI.AREA_NAVBAR,
			removable: true,
			label: button_label, // button title
			tooltiptext: button_label, // tooltip title
			onClick: function(event) {
			  if(event.button==0) {
			    var windows = Services.wm.getEnumerator(null);
				while (windows.hasMoreElements()) {
				  var win = windows.getNext();
				  
				  var vAddonBar = win.document.getElementById('v_addonbar');
				  setToolbarVisibility(vAddonBar, vAddonBar.collapsed);
					  
				  var vAddonBarBox = win.document.getElementById('toolbox_vab');
				  setToolbarVisibility(vAddonBarBox, vAddonBarBox.collapsed);
					  
				  Services.prefs.getBranch('browser.vaddonbar.').setBoolPref('enabled',!vAddonBar.collapsed);
				  
				  if(!vAddonBar.collapsed)
					win.document.querySelector('#togglebutton_v_addonbar').setAttribute('checked','true');
				  else win.document.querySelector('#togglebutton_v_addonbar').removeAttribute('checked');
				}
			  }
			},
			onCreated: function(button) {
			  if(Services.prefs.getBranch('browser.vaddonbar.').getBoolPref('enabled'))
			    button.setAttribute('checked','true');
			  return button;
			}
				
		});
	  }

	  // Press 'Ctr + Alt + /' on Windows/Linux and 'Cmd + Alt + /' on macOS to toggle vertical add-on bar
	  var key = document.createXULElement('key');
	  key.id = 'key_toggleVAddonBar';
	  key.setAttribute('key', '/');
	  key.setAttribute('modifiers', 'accel,alt');
	  key.setAttribute('oncommand',`
		var windows = Services.wm.getEnumerator(null);
		while (windows.hasMoreElements()) {
		  var win = windows.getNext();
		  var vAddonBar = win.document.getElementById('v_addonbar');
		  setToolbarVisibility(vAddonBar, vAddonBar.collapsed);
		  var vAddonBarBox = win.document.getElementById('toolbox_vab');
		  setToolbarVisibility(vAddonBarBox, vAddonBarBox.collapsed);
		  Services.prefs.getBranch('browser.vaddonbar.').setBoolPref('enabled',!vAddonBar.collapsed);
		  if(!vAddonBar.collapsed)
			win.document.querySelector('#togglebutton_v_addonbar').setAttribute('checked','true');
		  else win.document.querySelector('#togglebutton_v_addonbar').removeAttribute('checked');
		}
	  `);
	  document.getElementById('mainKeyset').appendChild(key);
	  
	 }
	} catch(e) {}
	
	// style toolbar & toggle button
	var v_addonbar_style = '';
	var togglebutton_v_addonbar_style = '';
	
	if(style_v_addonbar) {
	  var end_border =`
		#v_addonbar {
			border-inline-end: 1px solid var(--sidebar-border-color,rgba(0,0,0,0.1)) !important;
		}
	  `;
		  
	  if(!v_addonbar_on_the_left) {
		end_border =`
		  #v_addonbar {
			border-inline-start: 1px solid var(--sidebar-border-color,rgba(0,0,0,0.1)) !important;
		  }
		`;
	  }

	  v_addonbar_style =`
		#v_addonbar {
		  appearance: none !important;
		  background-color: var(--toolbar-bgcolor);
		  background-image: var(--toolbar-bgimage);
		  background-clip: padding-box;
		  color: var(--toolbar-color, inherit);
		}
		#main-window:-moz-lwtheme #v_addonbar {
		  background: var(--lwt-accent-color) !important;
		}
		#main-window[lwtheme-image='true']:-moz-lwtheme #v_addonbar {
		  background: var(--lwt-header-image) !important;
		  background-position: 0vw 50vh !important;
		}
		#main-window:not([customizing]) #toolbox_vab:not([collapsed='true']),
		#main-window:not([customizing]) #v_addonbar:not([collapsed='true']) {
		  min-width: `+v_addonbar_width+`;
		  width: `+v_addonbar_width+`;
		  max-width: `+v_addonbar_width+`;
		}
		#main-window[chromehidden='menubar toolbar location directories status extrachrome '] #toolbox_vab:not([collapsed='true']),
		#main-window[chromehidden='menubar toolbar location directories status extrachrome '] #v_addonbar:not([collapsed='true']),
		#main-window[sizemode='fullscreen'] #toolbox_vab:not([collapsed='true']),
		#main-window[sizemode='fullscreen'] #v_addonbar:not([collapsed='true']) {
		  min-width: 0px;
		  width: 0px;
		  max-width: 0px;
		}
		#main-window[customizing] #v_addonbar {
		  outline: 1px dashed !important;
		  outline-offset: -2px !important;
		}
		#v_addonbar:-moz-lwtheme {
		  background: var(--lwt-header-image) !important;
		  background-position: 100vw 50vh !important;
		}
		#v_addonbar toolbarbutton,
		#v_addonbar toolbar .toolbarbutton-1 {
		  padding: 0 !important;
		}
		`+end_border+`
	  `;
	}
	
	var addonbar_right = '';
	
	if(!v_addonbar_on_the_left) {
		addonbar_right =`
		  #toolbox_vab{
			order: 10 !important;
		  }
		`;
	}
	
	if(v_addonbar_togglebutton) {
	  togglebutton_v_addonbar_style =`
		#togglebutton_v_addonbar .toolbarbutton-icon { \
		  list-style-image: url('chrome://browser/skin/sidebars.svg');
		  fill: green; 
		}
		/*#togglebutton_v_addonbar .toolbarbutton-icon {
		  list-style-image: url('chrome://browser/skin/forward.svg');
		  fill: red;
		}
		#togglebutton_v_addonbar[checked] .toolbarbutton-icon {
		  fill: green;
		}
		#togglebutton_v_addonbar {
		  background: url('chrome://browser/skin/back.svg') no-repeat;
		  background-size: 35% !important;
		  background-position: 10% 70% !important;
		}
		#togglebutton_v_addonbar[checked] {
		  transform: rotate(180deg) !important;
		  background: url('chrome://browser/skin/back.svg') no-repeat;
		  background-position: 10% 30% !important;
		}*/
	  `;
	}
	
	var compact_buttons_code = '';
	
	if(compact_buttons)
	  compact_buttons_code = `
		#v_addonbar toolbarbutton .toolbarbutton-icon {
		  padding: 0 !important;
		  width: 16px !important;
		  height: 16px !important;
		}
		#v_addonbar .toolbarbutton-badge-stack {
		  padding: 0 !important;
		  margin: 0 !important;
		  width: 16px !important;
		  min-width: 16px !important;
		  height: 16px !important;
		  min-height: 16px !important;
		}
		#v_addonbar toolbarbutton .toolbarbutton-badge {
		  margin-top: 0px !important;
		  font-size: 8px !important;
		}
	  `;
	  
	var uri = Services.io.newURI('data:text/css;charset=utf-8,' + encodeURIComponent(''+v_addonbar_style + togglebutton_v_addonbar_style + addonbar_right + compact_buttons_code), null, null);
	  
	var sss = Components.classes['@mozilla.org/content/style-sheet-service;1'].getService(Components.interfaces.nsIStyleSheetService);
	sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
	
  }

}

/* initialization delay workaround */
document.addEventListener('DOMContentLoaded', VerticalAddonbar.init(), false);
/* Use the below code instead of the one above this line, if issues occur */
/*
setTimeout(function(){
  VerticalAddonbar.init();
},2000);
*/

