const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const { inject, uninject } = require("powercord/injector");
const { findInReactTree } = require('powercord/util');

const { clipboard } = require('electron');

module.exports = class CopyServerIcon extends Plugin {
    startPlugin() {
        const Menu = getModule(['MenuItem'], false);
        const GuildContextMenu = getModule((m) => m.default && m.default.displayName === 'GuildContextMenu', false);

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
    }

    pluginWillUnload() {
        uninject('server-icon-url-button');
    }
}