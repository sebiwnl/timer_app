<script lang="ts">
    import "../layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import { SidebarTrigger } from "$lib/components/ui/sidebar/index.js";

    let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Sidebar.Provider>
    <AppSidebar />
    <Sidebar.Inset>
        <!-- Compact header with just the trigger -->
        <header
            class="flex items-center h-10 px-3 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <SidebarTrigger class="-ml-1" />
        </header>
        <main class="w-full">
            {@render children()}
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>
