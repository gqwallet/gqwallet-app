<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <!-- No :key here: Component stays the same AppShell instance across its nested routes
       (dashboard, cards, ...), which already animate via AppShell's own RouterView.
       This only transitions between top-level components (welcome/sign-up/sign-in/
       onboarding/AppShell), where Component itself changes. -->
  <!-- Explicit :duration matches the .screen-* CSS (200ms): without it, mode="out-in"
       waits for a `transitionend` DOM event on the leaving root before mounting the next
       route, and some view/layout combinations never fire it (observed with CalendarView's
       viewport-bound height), permanently freezing the outlet at an empty placeholder.
       :duration switches Vue to a plain timer instead, so the swap always completes. -->
  <RouterView v-slot="{ Component }">
    <Transition name="screen" mode="out-in" :duration="200">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
