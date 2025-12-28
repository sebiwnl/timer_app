<script lang="ts">
    import "../layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";

    let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Sidebar.Provider>
    <AppSidebar />
    <Sidebar.Inset>
        <main class="w-full">
            {@render children()}
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>
