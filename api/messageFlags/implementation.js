var { ExtensionCommon } = ChromeUtils.import(
  "resource://gre/modules/ExtensionCommon.jsm",
);

thunderbirdVersion = parseInt(Services.appinfo.version.split(".")[0]);
function tb115(yes, no) {
  if (thunderbirdVersion >= 115) {
    if (yes) {
      return typeof yes == "function" ? yes() : yes;
    }
  } else {
    if (no) {
      return typeof no == "function" ? no() : no;
    }
  }
}

const FLAGS = {
  // "name": [DBvalue, DBfunction, IMAPvalue]
  replied: [0x02, tb115("markReplied", "MarkReplied"), 0x02],
  forwarded: [0x1000, tb115("markForwarded", "MarkForwarded"), 0x40],
};

var messageFlags = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      messageFlags: {
        async getFlagValues(flagKey, messageIds) {
          let flagValue = FLAGS[flagKey][0];
          let values = [];
          for (let messageId of messageIds) {
            let msgHdr = context.extension.messageManager.get(messageId);
            values[messageId] = msgHdr.flags & flagValue ? true : false;
          }
          return values;
        },
        async setFlagValues(flagKey, flagValue, messageIds) {
          let msgHdrs = messageIds.map((i) =>
            context.extension.messageManager.get(i),
          );
          let imapFolders = {};
          let imapFolderKeys = {};
          for (let msgHdr of msgHdrs) {
            let folder = msgHdr.folder;
            let markFunction = folder.msgDatabase[FLAGS[flagKey][1]];
            markFunction(msgHdr.messageKey, flagValue, null);
            if (folder instanceof Ci.nsIMsgImapMailFolder) {
              if (!imapFolders[folder.uri]) {
                imapFolders[folder.uri] = folder;
                imapFolderKeys[folder.uri] = [];
              }
              imapFolderKeys[folder.uri].push(msgHdr.messageKey);
            }
          }
          let imapFlag = FLAGS[flagKey][2];
          for (let uri of Object.keys(imapFolders)) {
            let folder = imapFolders[uri];
            let keys = imapFolderKeys[uri];
            folder.storeImapFlags(imapFlag, flagValue, keys, null);
          }
        },
      },
    };
  }
};
