import {defineConfig} from 'vite';
export default defineConfig({
 build:{rolldownOptions:{onwarn(warning,defaultHandler){if(warning.code==='MODULE_LEVEL_DIRECTIVE')return;defaultHandler(warning);},output:{codeSplitting:{groups:[{name:'astryx',test:/node_modules\/@astryxdesign/},{name:'react',test:/node_modules\/(react|react-dom|scheduler)\//}]}}}}
});
