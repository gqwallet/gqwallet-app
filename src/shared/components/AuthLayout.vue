<script setup lang="ts">
// Minimal public chrome for the auth flow: a brand topbar over a centered card.
</script>

<template>
  <div class="flex min-h-full flex-col bg-page">
    <header class="flex h-15 items-center justify-between border-b border-line bg-surface px-6">
      <span class="text-[18px] font-bold text-ink">GQWallet</span>
      <slot name="topbar-end" />
    </header>

    <main class="flex flex-1 items-center justify-center p-6">
      <div class="w-full max-w-100 rounded-2xl border border-line bg-surface p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
