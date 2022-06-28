import { PlElement, html, css } from "polylib";

import './pl-combobox-list.js';

import '@plcmp/pl-dropdown';
import '@plcmp/pl-icon';
import '@plcmp/pl-iconset-default';
import '@plcmp/pl-input';
import '@plcmp/pl-dom-if';
import "@plcmp/pl-checkbox";

class PlCombobox extends PlElement {
    static get properties() {
        return {
            data: { type: Array, value: () => [], observer: '_dataObserver' },
            value: { type: String, observer: '_valueObserver' },
            text: { type: String, observer: '_textObserver' },
            selected: { type: Object, observer: '_selectedObserver' },
            label: { type: String },

            required: { type: Boolean },
            readonly: { type: Boolean },
            invalid: { type: Boolean },
            variant: { type: String },
            
            orientation: { type: String },
            stretch: { type: Boolean, reflectToAttribute: true },
            placeholder: { type: String },
            textProperty: { type: String, value: 'caption' },
            valueProperty: { type: String, value: 'id' },
            disabled: { type: Boolean, reflectToAttribute: true },
            hidden: { type: Boolean, reflectToAttribute: true },
            
            _ddOpened: { type: Boolean, value: false, observer: '_ddOpenedObserver' },
            _search: { type: Boolean, value: false },
            allowCustomValue: { type: Boolean, value: false },
            multiSelect: { type: Boolean, value: false },
            tree: { type: Boolean, value: false },
            selectOnlyLeaf: { type: Boolean, value: false },
            keyProperty: { type: String },
            parentProperty: { type: String },
            _rowTemplate: { type: Object }
        };
    }

    static get css() {
        return css`
            :host {
                display: inline-block;
            }

            :host([hidden]) {
                display: none;
            }

            :host([stretch]) {
                width: 100%;
            }

            pl-dropdown {
                background: var(--surface-color);
                border-radius: var(--border-radius);
                box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
                max-height: 254px;
                min-width: var(--content-width);
                box-sizing: border-box;
                overflow: auto;
                padding: var(--space-md) 0;
            }
    	`;
    }

    static get template() {
        return html`
            <pl-input stretch="[[stretch]]" readonly="[[readonly]]" disabled="{{disabled}}" id="input" placeholder="[[placeholder]]"
                value="{{text}}" required="[[required]]" invalid="{{invalid}}" label="[[label]]" orientation="[[orientation]]"
                on-click="[[_onToggle]]">
                <slot name="prefix" slot="prefix"></slot>
                <slot name="suffix" slot="suffix"></slot>
                <slot name="label-prefix" slot="label-prefix"></slot>
                <slot name="label-suffix" slot="label-suffix"></slot>
                <pl-icon-button variant="link" hidden="[[!value]]" slot="suffix" iconset="pl-default" size="12" icon="close"
                    on-click="[[_onClearClick]]"></pl-icon-button>
                <pl-icon-button variant="link" iconset="pl-default" slot="suffix" size="16" icon="chevron-down"></pl-icon-button>
            </pl-input>
            <pl-dropdown id="dd" opened="{{_ddOpened}}">
                <pl-dom-if if="{{_ddOpened}}">
                    <template>
                        <pl-combobox-list tree="[[tree]]" multi-select="[[multiSelect]]" select-only-leaf="[[selectOnlyLeaf]]"
                            data="[[data]]" text-property="[[textProperty]]" value-property="[[valueProperty]]"
                            _search="[[_search]]" selected="{{selected}}" _ddOpened="[[_ddOpened]]" on-select="[[_onSelect]]"
                            text="[[text]]">
                        </pl-combobox-list>
                    </template>
                </pl-dom-if>
            </pl-dropdown>
		`;
    }

    connectedCallback() {
        super.connectedCallback()
        if (this.variant) {
            console.log('Variant is deprecated, use orientation instead');
            this.orientation = this.variant;
        }
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
    _valueObserver(newValue) {
        if (this.inStack) { return; }

        let found;
        if (this.data) {
            found = this.data.find((item, index) => {
                const value = item[this.valueProperty];
                if (value == newValue) {
                    this.selected = item;
                    this.__setText(item[this.textProperty]);
                    return true;
                }
            });
        }
        if (!found) {
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

    _onSelect(event) {
        this._search = false;
        this.__setValue(event.detail.model[this.valueProperty]);
        this.__setText(event.detail.model[this.textProperty]);
        this._ddOpened = false;
        this.selected = event.detail.model;
    }
}

customElements.define('pl-combobox', PlCombobox);