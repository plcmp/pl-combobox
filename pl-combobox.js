import { PlElement, html, css } from "polylib";

import '@plcmp/pl-dropdown';
import '@plcmp/pl-icon';
import '@plcmp/pl-iconset-default';
import '@plcmp/pl-input';
import '@plcmp/pl-repeat';

class PlCombobox extends PlElement {
    static get properties() {
        return {
            data: { type: Array, value: () => [], observer: '_dataObserver' },
            value: { type: String, observer: '_valueObserver' },
            text: { type: String, observer: '_textObserver' },
            selected: { type: Object, observer: '_selectedObserver' },
            label: { type: String },
            required: { type: Boolean },
            invalid: { type: Boolean },
            variant: { type: String },
            placeholder: { type: String },
            textProperty: { type: String, value: 'text' },
            valueProperty: { type: String, value: 'value' },
            disabled: { type: Boolean },
            _ddOpened: { type: Boolean, value: false, observer: '_ddOpenedObserver' },
            _search: { type: Boolean, value: false }
        };
    }

    static get css() {
        return css`
			pl-icon {
				cursor: pointer;
                --pl-icon-fill-color: none;
                --pl-icon-stroke-color: var(--grey-dark);
			}


			pl-icon:hover {
                --pl-icon-stroke-color: var(--black-light);
			}

            pl-dropdown {
                border-radius: 4px;
                max-height: 254px;
                min-width: var(--content-width);
                box-sizing: border-box;
                margin: 0px;
                --dropdown-padding: 0px;
                overflow: auto;
            }

            .comboitem {
                box-sizing: border-box;
                padding: 8px;
                min-height: 32px;
                width: 100%;
                font: var(--font-md);
                line-height: 150%;
                color: var(--black-light);
                display: flex;
                align-items: center;
                cursor: pointer;
            }

            .comboitem:hover {
                background-color: var(--grey-lightest)
            }

            pl-icon[hidden] {
                display: none;
            }
    	`;
    }

    static get template() {
        return html`
			<pl-input disabled="{{disabled}}" id="input" placeholder="[[placeholder]]" value="{{text}}" required="[[required]]" invalid="{{invalid}}" label="[[label]]" variant="[[variant]]" on-click="[[_onToggle]]">
                <pl-icon hidden$="[[!value]]" slot="suffix" iconset="pl-default" size="16" icon="close-s" on-click="[[_onClearClick]]"></pl-icon>
                <pl-icon slot="suffix" iconset="pl-default" size="16" icon="chevron-down-s"></pl-icon>
            </pl-input>
			<pl-dropdown id="dd" opened="{{_ddOpened}}">
                <pl-repeat items="[[_filterData(data, text, _search)]]">
                    <template>
                        <div class="comboitem" on-click="[[_onSelect]]">
                            <div inner-h-t-m-l="[[_itemText(item, text, _search, _ddOpened)]]"></div>
                        </div>
                    </template>
                </pl-repeat>
			</pl-dropdown>
		`;
    }

    connectedCallback() {
        super.connectedCallback();
        this.$.input.validators.push(this.validator.bind(this));
    }

    _selectedObserver(item) {
        if (item) {
            this.__setItem(item);
        }
    }

    _onToggle(event) {
        this.set('_ddOpened', !this._ddOpened);
        event.stopPropagation();
    }

    __setValue(value) {
        this.inStack = true;
        this.value = value;
        this.inStack = false;
    }

    __setText(text) {
        this.inStack = true;
        this.text = text;
        this.inStack = false;
    }

    __setItem(item) {
        const newValue = item[this.valueProperty];

        this.__setValue(newValue);

        this.data.find((i, index) => {
            const value = i[this.valueProperty];
            if (value == newValue) {
                this.selected = i;
                this.__setText(i[this.textProperty]);

                return true;
            }
            return false;
        });
    }

    _dataObserver(newData) {
        if (this.inStack) { return; }
        this.inStack = true;
        this.set('data', []);
        this.inStack = false;

        if (!newData || !newData.length) {
            return;
        }

        if (newData[0] instanceof Object) {
            this.inStack = true;
            this.set('data', newData);
            this.inStack = false;
        } else {
            let d = [];
            newData.forEach((text) => {
                d.push({ [this.valueProperty]: text, [this.textProperty]: text });
            });
            this.set('data', d);
        }
        const val = this.__storedValue !== undefined ? this.__storedValue : this.value;
        if (this.get('value') != val) {
            this.set('value', val);
        } else {
            this.__setText();
            this._valueObserver(val);
        }
        this.__storedValue = undefined;
    }

    _onClearClick(event) {
        this.value = null;
        this.text = null;
        this.__storedValue = undefined;

        event.stopImmediatePropagation();
    }
    _valueObserver(newValue, oldValue, mut) {
        if (this.inStack) { return; }

        let finded;
        if (this.data) {
            finded = this.data.find((item, index) => {
                const value = item[this.valueProperty];
                if (value == newValue) {
                    this.selected = item;
                    this.__setText(item[this.textProperty]);
                    return true;
                }
            });
        }
        if (!finded) {
            if (this.allowCustomValue || newValue === null || newValue === undefined) {
                this.__setText(newValue);
            } else {
                this.__storedValue = this.__storedValue !== undefined ? this.__storedValue : newValue;
            }
        } else {
            this.__storedValue = undefined;
        }
    }

    _textObserver(newValue, oldValue, mut) {
        if (this.inStack) { return; }

        if (!this._search && !this._ddOpened) {
            let fValue = false;
            this.data && (fValue = this.data.find((item) => {
                const text = item[this.textProperty];
                if (text == newValue) {
                    this.__setValue(item[this.valueProperty]);
                    return true;
                }
                return false;
            }));
            if (!fValue) {
                if (!this.allowCustomValue) {
                    this.__setText(mut.oldValue);
                } else {
                    this.__setValue(newValue);
                }
            }
        } else {
            if (this.allowCustomValue) {
                this.__setValue(newValue);
            }
        }
        this._search = this._ddOpened;
    }

    validator(val) {
        let messages = [];
        if (!this.value && this.text) {
            messages.push('Значение не может быть пустым');
        }

        return messages.length > 0 ? messages.join(';') : undefined;
    }

    _ddOpenedObserver(val) {
        if (this._ddOpened) {
            this.$.dd.open(this.$.input._inputContainer);
            this._search = false;
        } else {
            this.$.dd.close();
            this._search = false;
            this._valueObserver(this.value);
        }
    }

    _filterData(data, text, _search) {
        let res = data;

        if (_search && text) {
            const fltr = this.caseSensetiveFilter ? text : text.toLowerCase();
            res = this.data ? this.data.filter(item => {
                const i = item[this.textProperty];
                return i && (this.caseSensetiveFilter ? i.indexOf(fltr) : i.toLowerCase().indexOf(fltr)) !== -1;
            }) : [];
        }

        return res;
    }

    _itemText(item, text, _search, _ddOpened) {
        let res;
        if (text) {
            if (_search) {
                /**
                 * Данное условие отрабатывает во время поиска необходимой записи в combobox (когда производится ввод/вставка символов в input)
                 */
                const txtPart = item[this.textProperty].match(new RegExp(text, 'i'));
                res = txtPart && item[this.textProperty].replace(new RegExp(text, 'i'), `<b>${txtPart[0]}</b>`);
            } else {
                /**
                 * Отображает выбранную запись в списке, как помеченную. Остальные же отображаются стандартным текстом.
                 */
                res = (this.selected === item) ? `<b>${item[this.textProperty]}</b>` : item[this.textProperty];
            }
        } else {
            res = item[this.textProperty]
        }
        return res;
    }

    _onSelect(event) {

        this._search = false;
        this.__setValue(event.model.item[this.valueProperty]);
        this.__setText(event.model.item[this.textProperty]);
        this._ddOpened = false;
        this.selected = event.model.item;
    }

}

customElements.define('pl-combobox', PlCombobox);