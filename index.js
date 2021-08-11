const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const { inject, uninject } = require("powercord/injector");

const { clipboard } = require('electron');

module.exports = class CopyServerIcon extends Plugin {
    startPlugin() {
        const Menu = getModule(['MenuItem'], false);
        const GuildContextMenu = getModule((m) => m.default && m.default.displayName === 'GuildContextMenu', false);

        inject('server-icon-url-button', GuildContextMenu, 'default', 
            ([{ guild }], res) => {
                res.props.children.push(
                    React.createElement(Menu.MenuItem, {
                        id: "icon-url-button",
                        label: "Copy Icon Url",
                        action: () => guild.icon ? clipboard.writeText(guild.getIconURL()) : powercord.api.notices.sendToast('no-icon-url', {
                                               header: `Guild ${guild.name} has no valid Icon.`,
                                               timeout: 5000
                                            })
                    })
                );
                return res;
            }
        );
        GuildContextMenu.default.displayName = 'GuildContextMenu';
    }

    pluginWillUnload() {
        uninject('server-icon-url-button');
    }
}