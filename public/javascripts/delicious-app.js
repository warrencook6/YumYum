import '../sass/style.scss';

import { $, $$ } from './modules/bling';

import autocomplete from './autocomplete';

// pass in the id of the inputs from the form
autocomplete( $('#address'), $('#lat'), $('#lng'));

