/*
 * Copyright (C) Camptocamp
 *
 * This file is part of geOrchestra
 *
 * geOrchestra is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with geOrchestra.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.namespace("GEOR");

GEOR.dataview = (function() {

    var store = null;
    
    var dataView = null;
    
    var OWSdb = {};
    
        
    var createButtons = function(URI) {
        if (!URI || !URI[0]) {
            return '';
        }
        var id, dl = [], view = [];
        for (var i=0,l=URI.length;i<l;i++) {
            id = OpenLayers.Util.createUniqueID('OWS_');
            //console.log(URI[0].protocol);
            switch (URI[0].protocol) {
            case 'OGC:WMS-1.1.1-http-get-map':
                if (URI[0].value) {
                    OWSdb[id] = URI[0];
                    view.push('<button class="x-list-btn" id="'+id+'">Visualiser la donnée '+URI[0].name+'</button>');
                }
                break;
            /*
            case '':
            case 'image/png':
            case 'WWW:DOWNLOAD-1.0-http--download':
                if (URI[0].value) {
                    OWSdb[id] = URI[0];
                    dl.push('<button class="x-list-btn" id="'+id+'">Télécharger la donnée '+URI[0].name+'</button>');
                }
                break;
            */
            }
        }
        return dl.join(' ')+view.join(' ');
    };
    
    
    var getTemplate = function() {
        return [
            '<tpl for=".">',
                '<div class="x-view-item">',
                    '<p><b>{title}</b></p>',
                    '<p>{abstract}</p>',
                    '{[this.buttons(values.URI)]}',
                    /*'Mots clés : ',
                    '<tpl for="subject">',
                        '&nbsp;{value} ',
                    '</tpl>',*/
                '</div>',
            '</tpl>'
        ].join('');
    };
    
    
    var onButtonClick = function(evt, elt) {
        if (!OWSdb[elt.id]) {
            return;
        }
        
        var services = [], layers = [];
        if (OWSdb[elt.id].name) {
            layers.push({
                layername: OWSdb[elt.id].name,
                metadataURL:"",
                owstype:"WMS",
                owsurl: OWSdb[elt.id].value
            });
        } else {
            services.push({
                text: "test serveur",
                metadataURL:"",
                owstype:"WMS",
                owsurl: OWSdb[elt.id].value
            });
        }
        var o = {services: services, layers: layers};
        
        var form = Ext.get('open-in-viewer').dom;
        form.data.value = new OpenLayers.Format.JSON().write(o);
        form.submit();
        // {"services":[],"layers":[{"layername":"bzh:Ulves","metadataURL":"http://test.geobretagne.fr:80/geonetwork/srv/fr/metadata.show?id=495","owstype":"WMS","owsurl":"http://geobretagne.fr/geoserver/bzh/wms"}]}
    };
    
    var onStoreLoad = function(s) {
        Ext.each(Ext.query('.x-list-btn'), function(e) {
            Ext.get(e).on('click', onButtonClick);
        });
        GEOR.waiter.hide();
        
        //getTotalCount
        GEOR.observable.fireEvent("storeloaded", {store: s});
    };
    
    
    var onStoreBeforeload = function() {
        // local db reset
        OWSdb = {};
    };
    
    var onStoreException = function() {
        GEOR.waiter.hide();
        //console.log(arguments);
        alert("Oops, il y a eu un problème.");
    };
    
    
    return {

        init: function(s) {
            if (!store) {
                store = new GeoExt.data.CSWRecordsStore({
                    url: GEOR.config.GEONETWORK_URL + '/csw', //'content.xml', //
                    listeners: {
                        "beforeload": onStoreBeforeload,
                        "load": onStoreLoad,
                        "exception": onStoreException
                    }
                });
            }
            return store;
        },
        
        
        getCmp: function() {
            if (!dataView) {
                dataView = new Ext.DataView({
                    store: store,
                    singleSelect: true,
                    //emptyText: 'No records to display',
                    overClass:'x-view-over',
                    cls: 'x-list',
                    autoScroll: true,
                    autoWidth: true,
                    //contentEl: "dataview", // FIXME: I cannot make it appear
                    //trackOver: true,
                    autoHeight: true,
                    tpl: new Ext.XTemplate(getTemplate(), {
                        buttons: createButtons
                    })
                });
            }
            return dataView;
        }


    };
})();