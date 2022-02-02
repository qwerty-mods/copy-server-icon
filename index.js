const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const { inject, uninject } = require("powercord/injector");
const { findInReactTree } = require('powercord/util');

const { clipboard } = require('electron');

module.exports = class CopyServerIcon extends Plugin {
    startPlugin() {
        this.lazyPatchContextMenu('GuildContextMenu', async (GuildContextMenu) => {
            const Menu = await getModule(['MenuItem']);
            inject('server-icon-url-button', GuildContextMenu, 'default', 
                ([{ guild }], res) => {
                    const copyIconUrl = React.createElement(Menu.MenuItem, {
                        id: "icon-url-button",
                        label: "Copy Icon URL",
                        action: () => guild.icon ? clipboard.writeText(guild.getIconURL()) : powercord.api.notices.sendToast('no-server-icon-url', {
                                            header: `Server '${guild.name}' has no valid Icon.`,
                                            timeout: 5000
                                            })
                    });

                    const devmodeItem = findInReactTree(res.props.children, child => child.props && child.props.id === 'devmode-copy-id');
                    const developerGroup = res.props.children.find(child => child.props && child.props.children === devmodeItem);
                    if (developerGroup) {
                        if (!Array.isArray(developerGroup.props.children)) {
                            developerGroup.props.children = [ developerGroup.props.children ];
                        }
                
                        developerGroup.props.children.push(copyIconUrl);
                    } else {
                        res.props.children.push([ React.createElement(Menu.MenuSeparator), React.createElement(Menu.MenuGroup, {}, copyIconUrl) ]);
                    }
                    return res;
                }
            );
            GuildContextMenu.default.displayName = 'GuildContextMenu';
        });
    }

    // Credit to SammCheese 
    async lazyPatchContextMenu(displayName, patch) {
        const filter = m => m.default && m.default.displayName === displayName
        const m = getModule(filter, false)
        if (m) patch(m)
        else {
            const module = getModule([ 'openContextMenuLazy' ], false)
            inject('copy-server-icon-lazy-contextmenu', module, 'openContextMenuLazy', args => {
                const lazyRender = args[1]
                args[1] = async () => {
                    const render = await lazyRender(args[0])
        
                    return (config) => {
                    const menu = render(config)
                    if (menu?.type?.displayName === displayName && patch) {
                        uninject('copy-server-icon-lazy-contextmenu')
                        patch(getModule(filter, false))
                        patch = false
                    }
                    return menu
                    }
                }
                return args
            }, true)
        }
    }

    pluginWillUnload() {
        uninject('server-icon-url-button');
        uninject('copy-server-icon-lazy-contextmenu');
    }
}
