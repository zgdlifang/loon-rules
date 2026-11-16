// 拼多多 · 隐藏主页「多多视频」入口（Quantumult X 脚本）
// 处理接口：
//   1. /api/alexa/homepage/hub        底栏 tabs 只保留 首页 / 消息 / 个人中心，剔除多多视频
//   2. /api/oak/integration/render     删除底部视频区块与直播浮层
// 规则来源：对照可莉去广告模块的底栏相关响应改写，仅保留与「多多视频」相关字段。
// 注意：QX 内置对象 $request / $response / $done 在运行时注入，本文件仅做语法校验时不执行。

var KEEP_PAGES = ["index.html", "chat_list.html", "personal.html"];

function filterTabs(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(function (tab) {
    return tab && KEEP_PAGES.indexOf(tab.link) !== -1;
  });
}

function main() {
  var url = ($request && $request.url) || "";
  var raw = ($response && $response.body) || "";
  if (!raw) {
    $done({});
    return;
  }

  var obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    // 非 JSON（或解析失败）时原样回传，避免破坏请求
    $done({ body: raw });
    return;
  }

  if (url.indexOf("/api/alexa/homepage/hub") !== -1) {
    if (obj && obj.result) {
      obj.result.bottom_tabs = filterTabs(obj.result.bottom_tabs);
      obj.result.buffer_bottom_tabs = filterTabs(obj.result.buffer_bottom_tabs);
    }
  } else if (url.indexOf("/api/oak/integration/render") !== -1) {
    if (obj) {
      delete obj.bottom_section_list;
      if (obj.ui) {
        delete obj.ui.bottom_section;
        if (obj.ui.live_section) {
          delete obj.ui.live_section.float_info;
        }
      }
    }
  }

  $done({ body: JSON.stringify(obj) });
}

main();
