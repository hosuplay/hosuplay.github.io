/* Sea question schema: id, answer, choices (answer + 3 names), base,
   hints (4 strings), photo (URL), silhouette (URL), optional focus [x,y].
   IDs should start with sea- to keep saved quiz history separate.
   Add approved data/assets and set ready:true to enable the sea menu.
   puzzleImages: [{id, answer, src}] is consumed by the shared puzzle engine. */
window.HOSU_ANIMAL_CATEGORIES = Object.freeze({
 land:{label:'육지동물',ready:true,href:'/animals/'},
 sea:{label:'바다동물',ready:false,href:'/animals/sea/',modes:['description','photo','silhouette'],questions:[],puzzleImages:[]}
});
