let parentMenu = await messenger.menus.create({
  contexts: ["message_list"],
  title: "Mark",
});

let menuIds = {
  replied: await messenger.menus.create({
    contexts: ["message_list"],
    parentId: parentMenu,
    title: messenger.i18n.getMessage("toggleReplied"),
    type: "checkbox",
  }),
  forwarded: await messenger.menus.create({
    contexts: ["message_list"],
    parentId: parentMenu,
    title: messenger.i18n.getMessage("toggleForwarded"),
    type: "checkbox",
  }),
};

async function doToggle(info, tab) {
  let messageIds = info.selectedMessages.messages.map((m) => m.id);
  if (!messageIds.length) return;
  let whichFlag = Object.keys(menuIds).filter(
    (k) => menuIds[k] == info.menuItemId,
  )[0];
  await messenger.messageFlags.setFlagValues(
    whichFlag,
    info.checked,
    messageIds,
  );
}

async function updateMenu(info, tab) {
  let selectedMessages = info.selectedMessages.messages;
  if (!selectedMessages.length) return;
  let messageId = selectedMessages[0].id;
  let repliedValue = (
    await messenger.messageFlags.getFlagValues("replied", [messageId])
  )[messageId];
  let forwardedValue = (
    await messenger.messageFlags.getFlagValues("forwarded", [messageId])
  )[messageId];
  messenger.menus.update(menuIds.replied, { checked: repliedValue });
  messenger.menus.update(menuIds.forwarded, { checked: forwardedValue });
  messenger.menus.refresh();
}

messenger.menus.onClicked.addListener(doToggle);
messenger.menus.onShown.addListener(updateMenu);
