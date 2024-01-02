// 参考 => https://qiita.com/blue928sky/items/287ac3ee1c33213d4d35 
// 「転送」ラベルにあるメールをlineで通知します。
// 通知したメールは「通知済み」ラベルに登録します。
// 「通知済み」ラベルにあるメールは次回からは通知されません。
// lineで通知したいアドレス亜h「転送」ラベルにメールが振り分けられるようにgmailで設定してください。
const HOME_LABEL = '転送';
const READ_LABEL = '通知済み';
const BODY_MAX_LENGTH = 300;

function main() {
  const newMessages = fetchHomeMail();
  newMessages.forEach(message => {
    sendLine(message);
  });
}

/** LINEヘ送信 */
function sendLine(message) {
  const lineToken = PropertiesService.getScriptProperties().getProperty('LINE_TOKEN');
  const payload = { 'message': message };
  const options = {
    "method": "post",
    "headers": { "Authorization": "Bearer " + lineToken },
    "payload": payload
  };

  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}

/** メールを取得 */
function fetchHomeMail() {
  const sendLabel = GmailApp.getUserLabelByName(READ_LABEL);
  const searchTerms = Utilities.formatString("label:%s -label:%s", HOME_LABEL, READ_LABEL);

  //取得
  const fetchedThreads = GmailApp.search(searchTerms);
  const fetchedMessages = GmailApp.getMessagesForThreads(fetchedThreads);
  const sendMessages = [];

  // 送信メッセージ配列に詰める
  fetchedMessages.forEach(message => {
    sendMessages.push(gmailToString(message[0]));
  });

  // 通知済みラベルを追加
  fetchedThreads.forEach(thread => {
    thread.addLabel(sendLabel);
  });

  // LINE用に配列の順番を反転させる
  return sendMessages.reverse();
}

/** メールの整形 */
function gmailToString(mail) {
  const mailFrom = mail.getFrom();
  const subject = mail.getSubject();
  const body = mail.getPlainBody().slice(0, BODY_MAX_LENGTH);

  return Utilities.formatString("\n%s\n\n件名：\n%s\n\n内容：\n%s", mailFrom, subject, body);
}

