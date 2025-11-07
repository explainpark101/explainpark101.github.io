<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script setup>
// Vue 3 Composition API 사용
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

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
    transition: background-color 500ms ease-in-out, color 500ms ease-in-out, border-color 500ms ease-in-out, box-shadow 500ms ease-in-out;
}

/* 다크모드 기본 설정 (브라우저 설정) */
@media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
        --primary-color: #90caf9;
        --primary-light: #42a5f5;
        --primary-dark: #1565c0;
        --text-primary: #ffffff;
        --text-secondary: #b0bec5;
        --background: #121212;
        --surface: #1e1e1e;
        --error: #ef5350;
        --success: #66bb6a;
        --border-color: #424242;
        --shadow-color: rgba(0, 0, 0, 0.3);
        --overlay-color: rgba(0, 0, 0, 0.7);
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
}

/* 사용자 설정 - 다크 모드 */
[data-theme="dark"],
body[data-theme="dark"] {
    --primary-color: #90caf9;
    --primary-light: #42a5f5;
    --primary-dark: #1565c0;
    --text-primary: #ffffff;
    --text-secondary: #b0bec5;
    --background: #121212;
    --surface: #1e1e1e;
    --error: #ef5350;
    --success: #66bb6a;
    --border-color: #424242;
    --shadow-color: rgba(0, 0, 0, 0.3);
    --overlay-color: rgba(0, 0, 0, 0.7);
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
