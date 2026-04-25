<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script setup>
// Vue 3 Composition API 사용
</script>

<style>
:root {
    --primary-color: #1976d2;
    --primary-light: #42a5f5;
    --primary-dark: #1565c0;
    --text-primary: #212121;
    --text-secondary: #757575;
    --background: #f5f5f5;
    --surface: #ffffff;
    --error: #d32f2f;
    --success: #388e3c;
    --border-color: #e0e0e0;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --overlay-color: rgba(0, 0, 0, 0.5);
    /* Todo / control chrome (light) */
    --control-muted: #e5e7eb;
    --control-muted-hover: #d1d5db;
    --row-progress-bg: #eff6ff;
    --row-progress-fg: #1d4ed8;
    --row-completed-bg: #f3f4f6;
    --state-done-bg: #f0fdf4;
    --state-done-fg: #15803d;
    --drag-tint: #dbeafe;
    --code-mark-bg: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
    transition: background-color 500ms ease-in-out, color 500ms ease-in-out, border-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

/* 다크: One Dark Pro — Darker 팔레트 (브라우저 다크, 테마 미지정) */
@media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
        --primary-color: #61afef;
        --primary-light: #7cc7ff;
        --primary-dark: #4a8fd4;
        --text-primary: #c8c9c9;
        --text-secondary: #6b7280;
        --background: #0f1115;
        --surface: #1a1d24;
        --error: #e06c75;
        --success: #98c379;
        --border-color: #2c313a;
        --shadow-color: rgba(0, 0, 0, 0.5);
        --overlay-color: rgba(0, 0, 0, 0.75);
        --control-muted: #1e222a;
        --control-muted-hover: #2a3039;
        --row-progress-bg: rgba(97, 175, 239, 0.14);
        --row-progress-fg: #9fd3ff;
        --row-completed-bg: rgba(255, 255, 255, 0.04);
        --state-done-bg: rgba(152, 195, 121, 0.12);
        --state-done-fg: #98c379;
        --drag-tint: rgba(97, 175, 239, 0.12);
        --code-mark-bg: linear-gradient(180deg, #2a3038 0%, #1e2228 100%);
    }
}

/* 사용자 설정 - 라이트 모드 */
[data-theme="light"],
body[data-theme="light"] {
    --primary-color: #1976d2;
    --primary-light: #42a5f5;
    --primary-dark: #1565c0;
    --text-primary: #212121;
    --text-secondary: #757575;
    --background: #f5f5f5;
    --surface: #ffffff;
    --error: #d32f2f;
    --success: #388e3c;
    --border-color: #e0e0e0;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --overlay-color: rgba(0, 0, 0, 0.5);
    --control-muted: #e5e7eb;
    --control-muted-hover: #d1d5db;
    --row-progress-bg: #eff6ff;
    --row-progress-fg: #1d4ed8;
    --row-completed-bg: #f3f4f6;
    --state-done-bg: #f0fdf4;
    --state-done-fg: #15803d;
    --drag-tint: #dbeafe;
    --code-mark-bg: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
}

/* 사용자 설정 — 다크 (One Dark Pro Darker) */
[data-theme="dark"],
body[data-theme="dark"] {
    --primary-color: #61afef;
    --primary-light: #7cc7ff;
    --primary-dark: #4a8fd4;
    --text-primary: #c8c9c9;
    --text-secondary: #6b7280;
    --background: #0f1115;
    --surface: #1a1d24;
    --error: #e06c75;
    --success: #98c379;
    --border-color: #2c313a;
    --shadow-color: rgba(0, 0, 0, 0.5);
    --overlay-color: rgba(0, 0, 0, 0.75);
    --control-muted: #1e222a;
    --control-muted-hover: #2a3039;
    --row-progress-bg: rgba(97, 175, 239, 0.14);
    --row-progress-fg: #9fd3ff;
    --row-completed-bg: rgba(255, 255, 255, 0.04);
    --state-done-bg: rgba(152, 195, 121, 0.12);
    --state-done-fg: #98c379;
    --drag-tint: rgba(97, 175, 239, 0.12);
    --code-mark-bg: linear-gradient(180deg, #2a3038 0%, #1e2228 100%);
}

html,
body {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    background-color: var(--background);
    color: var(--text-primary);
    transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}

#app {
    width: 100%;
    min-height: 100vh;
    background-color: var(--background);
    color: var(--text-primary);
    transition: background-color 500ms ease-in-out, color 500ms ease-in-out;
}
</style>
