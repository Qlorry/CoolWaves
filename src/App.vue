<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="d-flex flex-column h-100">
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" to="/">Home</RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/simple">Simple</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/tracker">Tracker</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/test">Test</RouterLink>
            </li>
            <!-- <li class="nav-item">
              <RouterLink class="nav-link" to="/simple">Simple</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/simple">Simple</RouterLink>
            </li> -->
          </ul>
        </div>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<style scoped></style>
