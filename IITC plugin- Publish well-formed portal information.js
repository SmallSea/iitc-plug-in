// ==UserScript==
// @id             iitc-plugin-publish-info
// @name           IITC plugin: Publish well-formed portal information
// @author         SmallSea
// @category       Debug
// @version        0.1.1.5
// @namespace      pInfo
// @updateURL      https://github.com/SmallSea/iitc-plugin/raw/master/debug-publish-info.user.js
// @downloadURL    https://github.com/SmallSea/iitc-plugin/raw/master/debug-publish-info.user.js
// @description    Publish well-formed portal information
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'jonatkins';
plugin_info.dateTimeVersion = '0.1.0.4';
plugin_info.pluginId = 'debug-publish-info';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.pInfo = function() {};

window.plugin.pInfo.setupCallback = function() {
    addHook('portalDetailsUpdated', window.plugin.pInfo.addLink);
}

window.plugin.pInfo.addLink = function(d) {
  $('.linkdetails').append('<aside><a onclick="window.plugin.pInfo.showPortalData(\''+window.selectedPortal+'\')" title="Display information of the portal">Publish Info</a></aside>');
}

window.plugin.pInfo.showPortalData = function(guid) {
  if (!window.portals[guid]) {
    console.warn ('Error: failed to find portal details for guid '+guid+' - failed to show debug data');
    return;
  }

  var data = window.portals[guid].options.data;
  var ts = window.portals[guid].options.timestamp;
  var title = 'Raw portal data: ' + (data.title || '<no title>');
  var details = portalDetail.get(guid);
  var mods = details.mods;
  var res = details.resonators;

  var modstring = [];
  var agentstring = [];
  for (var i = 0; i < mods.length; i++) {
    if (mods[i] == null) {
        continue;
    }
    var mod = ''
      switch (mods[i].rarity) {
          case "COMMON":
              mod = 'C';
              break;
          case "RARE":
              mod = 'R';
              break;
          case "VERY_RARE":
              mod = 'VR';
              break;
      }
      switch(mods[i].name) {
          case "Portal Shield":
              mod = mod + 'P';
              break;
          case "Heat Sink":
              mod = mod + 'HS';
              break;
          case "Multi-hack":
              mod = mod + 'MH';
              break;
          case "Force Amp":
              mod = 'FA';
              break;
          case "Turret":
              mod = 'T';
              break;
          case "Link Amp":
              if (mods[i].rarity != 'VERY_RARE')
                  mod = 'LA';
              else
                  mod = "VRLA";
              break;
          case "AXA Shield":
              mod = 'AXA';
              break;
          case "Ito En Transmuter (+)":
              mod = 'IET+';
              break;
          case "Ito En Transmuter (-)":
              mod = 'IET-';
              break;
          case "SoftBank Ultra Link":
              mod = 'SULA';
              break;
    }
    modstring.push(mod);
    agentstring.push('@' + mods[i].owner);
  }

  for (var i = 0; i < res.length; i++) {
    if (res[i] == null) {
        continue;
    }
    agentstring.push('@' + res[i].owner);
  }

  function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{6})+(?!\d))/g, "$1.");
  }

  var ll = formatNumber(data.latE6) + ',' + formatNumber(data.lngE6);

  function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
  }

  var uniqueAgents = unique(agentstring);

  var frackerString = '';
  var ornaments = details.ornaments;

  for (var i = 0; i < ornaments.length; i++) {
    if (ornaments[i] == 'peFRACK') {
        frackerString = '( Notice: Portal fracker is frying NOW!!! ) \n';
    }
  }

  var body =
    data.team + ' / L' + data.level + ' / ' + data.title + '\n' + 
    frackerString +
    'MODs: ' + modstring.join("/") +'\n' + 
    'Agents: ' + uniqueAgents.join(" ") +'\n' + 
    'Intel: http://ingress.com/intel?pll=' + ll + '&z=17 \n' +
    'gMap: http://maps.google.com/?q=' + ll;

  var text =
	'<textarea id = "pInfo" readonly = "readonly">'+ body +'</textarea>' +
	'<button id = "copy-button" type = "button"> Copy </button>' +
	'<script>' +
	'  document.getElementById("copy-button").addEventListener("click", function (event) {' +
	'    event.preventDefault();' +
	'    document.getElementById("pInfo").select();' +
	'    document.execCommand("copy");' +
	'  });' +
	'</script>';
	  
  dialog({
    title: title,
    html: text,
    id: 'dialog-pInfo',
    dialogClass: 'ui-dialog-pInfo',
  });
}

var setup = function () {
  window.plugin.pInfo.setupCallback();
  $('head').append('<style>' +
    '.ui-dialog-pInfo { '+
	'  width: 550px !important; '+
	'}' +
	'#dialog-pInfo {' +
	'  overflow-x: auto;' +
	'  overflow-y: auto;' +
	'}' +
	'#pInfo {' +
	'  width: 100%;' +
	'  height: 100px;' +
	'  resize: none;' +
	'  overflow: auto;' +
    '  background-color: rgba(8, 48, 78, 0.9);' +
	'  color: white;' +
	'  outline: none;' +
	'  border-color: #20a8b1;' +
	'}'+
	'#copy-button {' +
	'  float: right;' +
	'  margin-top: 4px;' +
	'  margin-right: -6px;' +
	'  margin-bottom: -6px;' +
	'}' +
	'#copy-button: hover {' +
	'  text-decoration: underline;' +
	'}' +
  '</style>');
}


// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
