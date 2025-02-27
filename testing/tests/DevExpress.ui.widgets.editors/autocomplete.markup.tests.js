import $ from 'jquery';
import keyboardMock from '../../helpers/keyboardMock.js';

import 'ui/autocomplete';

QUnit.testStart(function() {
    const markup =
        '<div id="qunit-fixture" class="dx-viewport">\
            <div id="widget"></div>\
            <div id="widthRootStyle"></div>\
        </div>';

    $('#qunit-fixture').html(markup);
    $('#widthRootStyle').css('width', '300px');
});

const WIDGET_CLASS = 'dx-autocomplete';
const TEXTEDITOR_CLASS = 'dx-texteditor';
const TEXTEDITOR_INPUT_CLASS = 'dx-texteditor-input';


QUnit.module('dxAutocomplete', {
    beforeEach: function() {
        this.element = $('#widget').dxAutocomplete({
            value: 'text',
            dataSource: ['item 1', 'item 2', 'item 3']
        });
        this.instance = this.element.dxAutocomplete('instance');
    }
}, () => {
    QUnit.test('markup init', function(assert) {
        const element = this.element;

        assert.ok(element.hasClass(WIDGET_CLASS), 'Element has ' + WIDGET_CLASS + ' class');
        assert.ok(element.hasClass(TEXTEDITOR_CLASS), 'Element has ' + TEXTEDITOR_CLASS + ' class');
    });

    QUnit.test('init with options', function(assert) {
        const element = $('#widget').dxAutocomplete({
            value: 'anotherText',
            placeholder: 'type something'
        });
        const instance = element.dxAutocomplete('instance');

        assert.equal(instance.option('value'), 'anotherText', 'autocomplete-s textbox value initialization');
        assert.equal(instance.option('placeholder'), instance.option('placeholder'), 'autocomplete-s successful placeholder initialization');

        instance.option('placeholder', 'abcde');
        assert.equal(instance.option('placeholder'), 'abcde', 'when we change autocomplete-s placeholder, we change textbox-s placeholder');
    });

    QUnit.test('change autocomplete\'s textbox value', function(assert) {
        this.instance.option('value', 'new value');
        assert.equal(this.instance.option('value'), 'new value');

        this.instance.option('value', 'newest value');
        assert.equal(this.instance.option('value'), 'newest value');
    });

    QUnit.test('maxLength', function(assert) {
        this.instance.option('maxLength', 5);
        assert.equal(this.instance.option('maxLength'), 5);

        this.instance.option('maxLength', 3);
        assert.equal(this.instance.option('maxLength'), 3);
    });

    QUnit.test('input should be empty when value is empty', function(assert) {
        const $autocomplete = $('#widget').dxAutocomplete({
            placeholder: 'test',
            value: ''
        });

        const $input = $autocomplete.find('.' + TEXTEDITOR_INPUT_CLASS);
        assert.equal($input.val(), '', 'input is empty');
    });

    QUnit.test('B251138 disabled', function(assert) {
        this.instance.option('disabled', true);
        assert.ok(this.instance.$element().hasClass('dx-state-disabled'), 'disabled state should be added to autocomplete itself');
        assert.ok(this.instance.option('disabled'), 'Disabled state should be propagated to texteditor');

        this.instance.option('disabled', false);
        assert.ok(!this.instance.$element().hasClass('dx-state-disabled'), 'disabled state should be removed from autocomplete itself');
        assert.ok(!this.instance.option('disabled'), 'Disabled state should be propagated to texteditor');
    });
});

QUnit.module('widget sizing render', () => {
    QUnit.test('constructor', function(assert) {
        const $element = $('#widget').dxAutocomplete({ width: 400 });
        const instance = $element.dxAutocomplete('instance');
        const elementStyles = $element.get(0).style;

        assert.strictEqual(instance.option('width'), 400);
        assert.strictEqual(elementStyles.width, '400px', 'width of the element must be equal to custom width');
    });

    QUnit.test('root with custom width', function(assert) {
        const $element = $('#widthRootStyle').dxAutocomplete();
        const elementStyles = $element.get(0).style;

        assert.strictEqual(elementStyles.width, '300px', 'width of the element must be equal to custom width');
    });

    QUnit.test('change width', function(assert) {
        const $element = $('#widget').dxAutocomplete();
        const element = $element.get(0);
        const instance = $element.dxAutocomplete('instance');

        instance.option('width', 400);

        assert.strictEqual(element.style.width, '400px', 'width of the element must be equal to custom width');
    });
});

QUnit.module('aria accessibility', {}, () => {
    QUnit.test('aria-autocomplete property', function(assert) {
        const $element = $('#widget').dxAutocomplete();
        const $input = $element.find('.' + TEXTEDITOR_INPUT_CLASS + ':first');

        assert.equal($input.attr('aria-autocomplete'), 'inline');
    });

    QUnit.test('aria role should not change to listbox after it\'s second rendering (T290859)', function(assert) {
        assert.expect(2);

        const $element = $('#widget').dxAutocomplete({
            searchEnabled: true,
            searchTimeout: 0,
            opened: true,
            items: ['item1', 'item2', 'item3']
        });

        const $input = $element.find(`.${TEXTEDITOR_INPUT_CLASS}`);
        assert.equal($input.attr('role'), 'combobox', 'aria role');

        const keyboard = keyboardMock($input);
        $input.focusin();
        keyboard.type('it');

        assert.equal($input.attr('role'), 'combobox', 'role was not changed');
    });
});
