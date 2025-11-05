class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <!-- Footer -->
            <footer style="border-color: #679376ff" class="w-full py-2 px-2 border-t-4 fixed bottom-0 bg-white">
                <div class="flex justify-center items-center gap-1">
                    <!-- Home -->
                    <button data-page="home_index.html" id="test" onclick="location.href='home_index.html'" class="flex flex-col items-center mx-auto w-[64px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                             fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12l-2 0l9 -9l9 9l-2 0"/>
                            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/>
                            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>
                        </svg>
                        <p class="text-base font-medium">Home</p>
                    </button>
        
                    <!-- Search -->
                    <button id="test" onclick="location.href='search_index.html'" class="flex flex-col items-center mx-auto w-[64px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                             fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/>
                            <path d="M21 21l-6 -6"/>
                        </svg>
                        <p class="text-base font-medium">Search</p>
                    </button>
        
                    <!-- Reviews -->
                    <button id="test" onclick="location.href='review_index.html'" class="flex flex-col items-center mx-auto w-[64px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                             fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>
                        </svg>
                        <p class="text-base font-medium">Reviews</p>
                    </button>
        
                    <!-- Saved -->
                    <button  id="test" onclick="location.href='saved_index.html'" class="flex flex-col items-center mx-auto w-[64px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                             fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z"/>
                        </svg>
                        <p class="text-base font-medium">Saved</p>
                    </button>
        
                    <!-- Profile -->
                    <button id="test" onclick="location.href='settings_index.html'" class="flex flex-col items-center mx-auto w-[64px]">
                        <svg id="testing" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                             fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
                            <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                            <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/>
                        </svg>
                        <p class="text-base font-medium">Profile</p>
                    </button>
                </div>
            </footer>
            <style>
                button {
                    transition: all .6s ease;
                }
                svg {
                    stroke: #3a4f41ff;
                    transition: all .6s ease;
                } 
                svg:hover{
                    stroke: #61b07eff;
                    transition: all .6s ease;
                }
            </style>
        `;
    }
}
customElements.define('site-footer', SiteFooter);