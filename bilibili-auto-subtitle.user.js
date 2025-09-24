// ==UserScript==
// @name         B站自动字幕（快捷键C & 切P自动）
// @namespace    https://github.com/Apixus/bilibili-auto-subtitle
// @version      1.0
// @description  按 C 打开字幕；切换分P时自动打开字幕，专为B站2025最新版优化
// @author       Apixus
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/*
// @grant        none
// @run-at       document-end
// @license      MIT
// @supportURL   https://github.com/Apixus/bilibili-auto-subtitle/issues
// @updateURL    https://github.com/Apixus/bilibili-auto-subtitle/raw/main/bilibili-auto-subtitle.user.js
// @downloadURL  https://github.com/Apixus/bilibili-auto-subtitle/raw/main/bilibili-auto-subtitle.user.js
// ==/UserScript==

(function () {
  'use strict';

  const KEY = 'KeyC';
  const NEED_SHIFT = false;

  /* 找字幕按钮：兼容 2025-06 新版 + 旧版 + 番剧页 */
  function querySubtitleBtn() {
    return document.querySelector(
      [
        '.bpx-player-ctrl-subtitle>button',// 新版 bpx
        '.bpx-player-ctrl-btn[aria-label*="字幕"]',
        '.bpx-player-ctrl-btn[aria-label*="CC"]',
        '.squirtle-subtitle-wrap>button',// 番剧播放器
        '.bpui-btn[title*="字幕"]',// 旧版
      ].join(',')
    );
  }

  /* 真正"打开字幕"：先展开菜单，再点第一项语言 */
  function clickSubtitle() {
    const menuBtn = document.querySelector('.bpx-player-ctrl-subtitle');
    if (!menuBtn) { 
      console.warn('[B站自动字幕] 未找到字幕菜单按钮'); 
      return; 
    }

    /* 如果菜单还没展开，先点一次 */
    const panel = document.querySelector('.bpx-player-ctrl-subtitle-box');
    if (!panel || panel.style.display === 'none') {
      menuBtn.click();
      console.log('[B站自动字幕] 展开字幕菜单');
    }

    /* 等 150 ms 让菜单渲染完 */
    setTimeout(() => {
      const langItem = document.querySelector(
        '.bpx-player-ctrl-subtitle-language-item[data-lan]'
      );
      if (langItem) {
        langItem.click();
        console.log('[B站自动字幕] 已选择语言，字幕已开启');
      } else {
        console.warn('[B站自动字幕] 菜单里未找到语言选项');
      }
    }, 150);
  }

  /* 1. 快捷键：按 C */
  document.addEventListener('keydown', e => {
    const inInput = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (!inInput && e.code === KEY && e.shiftKey === NEED_SHIFT && !e.repeat) {
      clickSubtitle();
    }
  });

  /* 2. 切 P 自动开字幕 */
  let lastP = new URLSearchParams(location.search).get('p');
  setInterval(() => {
    const nowP = new URLSearchParams(location.search).get('p');
    if (nowP !== lastP) {
      lastP = nowP;
      setTimeout(clickSubtitle, 1500);
    }
  }, 1000);

  /* 3. 首次进入视频页也自动开 */
  window.addEventListener('load', () => setTimeout(clickSubtitle, 3000));
})();