//mypreset.ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const MyPreset = definePreset(Aura, {
    //Your customizations, see the following sections for examples
    // semantic: {
    //     primary: {
    //         50: '{blue.50}',
    //         100: '{blue.100}',
    //         200: '{blue.200}',
    //         300: '{blue.300}',
    //         400: '{blue.400}',
    //         500: '{blue.500}',
    //         600: '{blue.600}',
    //         700: '{blue.700}',
    //         800: '{blue.800}',
    //         900: '{blue.900}',
    //         950: '{blue.950}'
    //     }
    // }
    semantic: {
        primary: {
            50: '#EEF2FC',
            100: '#D8E1F8',
            200: '#B3C4F0',
            300: '#8EA6E8',
            400: '#5C76D7',
            500: '#112E81', // Primary
            600: '#0F2974',
            700: '#0C2261',
            800: '#091B4E',
            900: '#06133A',
            950: '#030A20'
        }
    }


});

export default MyPreset;