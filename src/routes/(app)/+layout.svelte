<script lang="ts">
    import "../layout.css";
    import favicon from "$lib/assets/favicon.svg";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import { SidebarTrigger } from "$lib/components/ui/sidebar/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { appState } from "$lib/state.svelte";
    import { supabase } from "$lib/supabaseClient";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import XIcon from "@lucide/svelte/icons/x";

    let { children } = $props();

    onMount(async () => {
        await appState.initializeSession();

        const hash = $page.url.hash;
        if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
            const { data, error } = await supabase.auth.getSession();
            if (data.session && data.session.user) {
                appState.user = data.session.user;
                goto("/", { replaceState: true });
            }
        }
    });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Sidebar.Provider>
    <AppSidebar />
    <Sidebar.Inset>
        <header
            class="flex items-center h-10 px-3 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <SidebarTrigger class="-ml-1" />

            <span class="ml-3 text-sm font-semibold text-foreground truncate">
                {appState.currentViewTitle}
            </span>

            <div class="flex-1"></div>

            {#if appState.view === 'editor' || appState.view === 'runner'}
                <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    onclick={() => appState.showList()}
                >
                    <XIcon class="w-4 h-4" />
                </Button>
            {/if}
        </header>
        <main class="w-full">
            {@render children()}
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>
