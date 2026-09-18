<script setup>
import { RouterLink, RouterView } from "vue-router";
import heroImg from "./assets/hero.png";
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow-sm px-4 lg:px-8 site-header">
      <!-- Logo -->
      <div class="flex-1">
        <RouterLink to="/" class="text-xl font-bold text-primary">
          <img :src="heroImg" alt="Logo" class="logo" />
        </RouterLink>
      </div>

      <!-- Centered Title -->
      <div class="absolute left-1/2 -translate-x-1/2">
        <RouterLink
          to="/rankings"
          class="text-md font-semibold whitespace-nowrap"
        >
          Fantasy Rankings
        </RouterLink>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex">
        <ul class="menu menu-horizontal gap-2">
          <li>
            <RouterLink to="/squad" active-class="active"> Squad </RouterLink>
          </li>

          <li>
            <RouterLink to="/rankings" active-class="active">
              Rankings
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Mobile Navigation -->
      <div class="dropdown dropdown-end md:hidden">
        <label tabindex="0" class="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>

        <ul
          tabindex="0"
          class="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <RouterLink to="/squad"> Squad </RouterLink>
          </li>

          <li>
            <RouterLink to="/rankings"> Rankings </RouterLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Page Content -->
    <main class="container mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
<style scoped>
.site-header {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 72px;
  padding: 0 24px;
  background: #17132b;
  color: #ffffff;
}

.logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
</style>
