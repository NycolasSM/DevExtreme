import $ from 'jquery';
import consoleUtils from 'core/utils/console';
import responsiveBoxScreenMock from '../../helpers/responsiveBoxScreenMock.js';
import {
    FORM_LAYOUT_MANAGER_CLASS,
    FIELD_ITEM_CLASS,
    FIELD_ITEM_LABEL_CLASS,
    FIELD_ITEM_CONTENT_CLASS,
    LAYOUT_MANAGER_ONE_COLUMN,
} from 'ui/form/constants';

import {
    FIELD_ITEM_HELP_TEXT_CLASS,
    FIELD_ITEM_OPTIONAL_CLASS,
    FIELD_ITEM_REQUIRED_CLASS,
    FIELD_ITEM_CONTENT_WRAPPER_CLASS,
    FIELD_ITEM_CONTENT_LOCATION_CLASS,
    FIELD_ITEM_LABEL_ALIGN_CLASS,
    LABEL_VERTICAL_ALIGNMENT_CLASS,
    LABEL_HORIZONTAL_ALIGNMENT_CLASS,
} from 'ui/form/components/field_item';

import {
    FIELD_ITEM_OPTIONAL_MARK_CLASS,
    FIELD_ITEM_LABEL_LOCATION_CLASS,
    FIELD_ITEM_REQUIRED_MARK_CLASS,
} from 'ui/form/components/label';

import {
    FIELD_EMPTY_ITEM_CLASS,
} from 'ui/form/components/empty_item';

import config from 'core/config';
import { isFunction, isDefined, isRenderer } from 'core/utils/type';
import windowUtils from 'core/utils/window';

import 'ui/switch';
import 'ui/autocomplete';
import 'ui/color_box';
import 'ui/drop_down_box';
import 'ui/select_box';
import 'ui/tag_box';
import 'ui/lookup';
import 'ui/text_area';
import 'ui/radio_group';
import 'ui/range_slider';
import 'ui/slider';
import 'ui/html_editor';
import '../../helpers/ignoreQuillTimers.js';


const READONLY_STATE_CLASS = 'dx-state-readonly';

const { test } = QUnit;

QUnit.testStart(() => {
    const markup =
        '<div id="container"></div>';

    $('#qunit-fixture').html(markup);
});

const supportedEditors = [
    'dxAutocomplete',
    'dxCalendar',
    'dxCheckBox',
    'dxColorBox',
    'dxDateBox',
    'dxDropDownBox',
    'dxLookup',
    'dxNumberBox',
    'dxRadioGroup',
    'dxRangeSlider',
    'dxSelectBox',
    'dxSlider',
    'dxSwitch',
    'dxTagBox',
    'dxTextArea',
    'dxTextBox',
    'dxHtmlEditor'
];

const createTestObject = () => ({
    'ID': 1,
    'FirstName': 'John',
    'LastName': 'Heart',
    'Prefix': 'Mr.',
    'Position': 'CEO',
    'Picture': 'images/employees/01.png',
    'BirthDate': '1964/03/16',
    'HireDate': '1995/01/15',
    'Notes': 'John has been in the Audio/Video industry since 1990. He has led DevAv as its CEO since 2003.\r\n\r\nWhen not working hard as the CEO, John loves to golf and bowl. He once bowled a perfect game of 300.',
    'Address': '351 S Hill St.',
    'StateID': 5
});

QUnit.module('Layout manager', () => {
    test('Default render', function(assert) {
        const contentReadyStub = sinon.stub();
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox'
            }],
            onContentReady: contentReadyStub
        });

        assert.ok($testContainer.hasClass(FORM_LAYOUT_MANAGER_CLASS), 'layout manager is rendered');
        assert.equal($testContainer.find('.dx-responsivebox').length, 1, 'responsive box is rendered');
        assert.equal($testContainer.find('.' + FIELD_ITEM_CLASS).length, 1, 'field items is rendered');
        assert.ok($testContainer.find('.' + FIELD_ITEM_CLASS).hasClass(LABEL_HORIZONTAL_ALIGNMENT_CLASS), 'field item has default label-align class');
        assert.equal($testContainer.find('.' + FIELD_ITEM_LABEL_CLASS).length, 1, 'label is rendered');
        assert.ok($testContainer.find('.' + FIELD_ITEM_LABEL_CLASS).hasClass(FIELD_ITEM_LABEL_LOCATION_CLASS + 'left'), 'label\'s location is left by default');
        assert.equal($testContainer.find('.' + FIELD_ITEM_CLASS + ' .dx-texteditor').length, 1, 'editor is rendered');
        assert.ok(!$testContainer.find('.' + FIELD_ITEM_CLASS + ' .dx-texteditor').hasClass(READONLY_STATE_CLASS), 'editor is not read only');
        assert.ok($testContainer.find('.' + FIELD_ITEM_CLASS + '> .' + FIELD_ITEM_CONTENT_CLASS).hasClass(FIELD_ITEM_CONTENT_LOCATION_CLASS + 'right'), 'Field item content has a right css class');
        assert.equal($testContainer.find('.' + FIELD_ITEM_CLASS + '> .' + FIELD_ITEM_CONTENT_CLASS + '> .dx-texteditor').length, 1, 'editor has field-item-content class');
        assert.equal(contentReadyStub.callCount, windowUtils.hasWindow() ? 1 : 0, 'contentReady event');
    });

    test('Default render with editorOptions.inputAttr', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            layoutData: {
                name: 'John'
            },
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox',
                editorOptions: {
                    inputAttr: {
                        alt: 'test'
                    }
                }
            }]
        });

        assert.equal($testContainer.find('.' + FIELD_ITEM_CLASS + ' .dx-texteditor-input').attr('alt'), 'test', 'attr merge successfully');
    });

    test('Default render with template', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            layoutData: {
                firstName: 'Alex',
                address: 'Winnipeg'
            },
            items: [{
                dataField: 'FirstName',
                itemType: 'simple',
                isRequired: true,
                template: function(data, element) {
                    $('<div>')
                        .appendTo(element)
                        .dxButton({
                            icon: 'find'
                        });

                    $('<div>')
                        .appendTo(element)
                        .dxTextBox(data.editorOptions)
                        .dxValidator({
                            validationGroup: data.component,
                            validationRules: [{
                                type: 'required',
                                message: 'Hire date is required'
                            }]
                        });
                }
            }, {
                dataField: 'address',
                editorType: 'dxTextBox'
            }]
        });
        const $items = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($items.length, 2, 'field items is rendered');
    });

    test('Default render with label template', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            layoutData: {
                firstName: 'Alex',
                address: 'Winnipeg'
            },
            items: [{
                dataField: 'FirstName',
                itemType: 'simple',
                isRequired: true,
                label: {
                    template: function(data, element) {
                        $('<div>')
                            .appendTo(element)
                            .dxButton({
                                icon: 'find',
                                text: 'find'
                            });
                    }
                }
            }]
        });
        const $button = $testContainer.find(`.${'dx-button'}`);
        assert.equal($button.length, 1, 'field item label with button is rendered');
    });

    test('Default render with marks', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox',
                isRequired: true
            }, {
                dataField: 'address',
                editorType: 'dxTextBox'
            }]
        });
        const $items = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($items.length, 2, 'field items is rendered');

        const $requiredItem = $items.eq(0);
        const $optionalItem = $items.eq(1);

        assert.ok($requiredItem.hasClass(FIELD_ITEM_REQUIRED_CLASS), 'field item has required class');
        assert.ok(!$requiredItem.hasClass(FIELD_ITEM_OPTIONAL_CLASS), 'field item hasn\'t optional class');
        assert.ok($requiredItem.find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).length, 'field item has required mark');
        assert.ok(!$requiredItem.find('.' + FIELD_ITEM_OPTIONAL_MARK_CLASS).length, 'field item hasn\'t optional mark');


        assert.ok(!$optionalItem.hasClass(FIELD_ITEM_REQUIRED_CLASS), 'field item hasn\'t required class');
        assert.ok($optionalItem.hasClass(FIELD_ITEM_OPTIONAL_CLASS), 'field item has optional class');
        assert.ok(!$optionalItem.find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).length, 'field item hasn\'t required mark');
        assert.ok(!$optionalItem.find('.' + FIELD_ITEM_OPTIONAL_MARK_CLASS).length, 'field item hasn\'t optional mark');
    });

    test('Show optional marks', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                dataField: 'address',
                editorType: 'dxTextBox'
            }],
            showOptionalMark: true
        });
        const $items = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($items.length, 1, 'field items is rendered');

        const $optionalItem = $items.eq(0);
        assert.ok(!$optionalItem.hasClass(FIELD_ITEM_REQUIRED_CLASS), 'field item hasn\'t required class');
        assert.ok($optionalItem.hasClass(FIELD_ITEM_OPTIONAL_CLASS), 'field item has optional class');
        assert.ok(!$optionalItem.find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).length, 'field item hasn\'t required mark');
        assert.ok($optionalItem.find('.' + FIELD_ITEM_OPTIONAL_MARK_CLASS).length, 'field item hasn optional mark');
    });

    test('Render custom marks', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            showOptionalMark: true,
            optionalMark: '-',
            requiredMark: '+',
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox',
                isRequired: true
            }, {
                dataField: 'address',
                editorType: 'dxTextBox'
            }]
        });
        const $items = $testContainer.find('.' + FIELD_ITEM_CLASS);

        const $requiredItem = $items.eq(0);
        const $optionalItem = $items.eq(1);

        assert.equal($.trim($requiredItem.find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).text()), '+', 'custom required mark');
        assert.equal($.trim($optionalItem.find('.' + FIELD_ITEM_OPTIONAL_MARK_CLASS).text()), '-', 'custom optional mark');
    });

    test('Change marks', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            showOptionalMark: true,
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox',
                isRequired: true
            }, {
                dataField: 'address',
                editorType: 'dxTextBox'
            }]
        });
        const instance = $testContainer.dxLayoutManager('instance');

        instance.option('optionalMark', '-');
        instance.option('requiredMark', '+');

        const $items = $testContainer.find('.' + FIELD_ITEM_CLASS);
        const $requiredItem = $items.eq(0);
        const $optionalItem = $items.eq(1);

        assert.equal($.trim($requiredItem.find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).text()), '+', 'custom required mark');
        assert.equal($.trim($optionalItem.find('.' + FIELD_ITEM_OPTIONAL_MARK_CLASS).text()), '-', 'custom optional mark');
    });

    test('Change marks visibility', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox',
                isRequired: true
            }, {
                dataField: 'address',
                editorType: 'dxTextBox'
            }]
        });
        const instance = $testContainer.dxLayoutManager('instance');
        const $items = $testContainer.find('.' + FIELD_ITEM_CLASS);

        instance.option('showOptionalMark', true);
        instance.option('showRequiredMark', false);

        const $requiredItem = $items.eq(0);
        const $optionalItem = $items.eq(1);

        assert.ok($requiredItem.find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).length, 'Item has no required mark');
        assert.ok(!$optionalItem.find('.' + FIELD_ITEM_OPTIONAL_MARK_CLASS).length, 'Item has optional mark');
    });

    test('Render read only layoutManager', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            readOnly: true,
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });

        assert.ok($testContainer.find('.' + FIELD_ITEM_CLASS + ' .dx-texteditor').hasClass(READONLY_STATE_CLASS), 'editor is read only');
    });

    test('Render label by default', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            form: {
                option: () => {},
                getItemID: () => {
                    return 'dx_FormID_name';
                }
            },
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_LABEL_CLASS).first();

        assert.equal($label.length, 1, 'label is rendered');
        assert.ok($label.hasClass(FIELD_ITEM_LABEL_LOCATION_CLASS + 'left'), 'label\'s location is left by default');
        assert.equal($label.text(), 'Name', 'text of label');
        assert.equal($label.attr('for'), 'dx_FormID_name', 'text of label');
        assert.ok($label.parent().hasClass(LABEL_HORIZONTAL_ALIGNMENT_CLASS), 'field item contains label has horizontal align class');
    });

    test('Baseline align of label for large editors is applied when browser is supported flex', function(assert) {
        const largeEditors = ['dxTextArea', 'dxRadioGroup', 'dxCalendar', 'dxHtmlEditor'];
        const customItems = ['item', 'itemWithHelpText'];
        const items = [...customItems, ...largeEditors].map(item => ({
            dataField: item,
            editorType: customItems.indexOf(item) > -1 ? 'dxTextBox' : item,
            helpText: item === 'itemWithHelpText' ? 'Test help text' : null
        }));
        const $testContainer = $('#container').dxLayoutManager();
        const layoutManager = $testContainer.dxLayoutManager('instance');

        layoutManager.option('items', items);
        const $items = $testContainer.find(`.${FIELD_ITEM_CLASS}`);

        $items.toArray().forEach((item, index) => {
            const hasBaseLine = index > 1;
            assert.equal($(item).hasClass(FIELD_ITEM_LABEL_ALIGN_CLASS), hasBaseLine, `item ${!hasBaseLine ? 'doesn\'t' : ''} have baseline alignment class`);
        });
    });

    test('Baseline align of label for large editors is not applied when label location is top', function(assert) {
        const largeEditors = ['dxTextArea', 'dxRadioGroup', 'dxCalendar', 'dxHtmlEditor'];
        const customItems = ['item', 'itemWithHelpText'];
        const $testContainer = $('#container').dxLayoutManager({
            labelLocation: 'top',
            items: [...customItems, ...largeEditors].map(item => ({
                dataField: item,
                editorType: customItems.indexOf(item) > -1 ? 'dxTextBox' : item,
                helpText: item === 'itemWithHelpText' ? 'Test help text' : null
            }))
        });

        const $items = $testContainer.find(`.${FIELD_ITEM_CLASS}`);

        $items.toArray().forEach(item => {
            assert.notOk($(item).hasClass(FIELD_ITEM_LABEL_ALIGN_CLASS), 'item doesn\'t have baseline alignment class');
        });
    });

    test('Render label for item without name or dateField', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            form: {
                option: () => {},
                getItemID: () => {
                    return 'dx_FormID_name';
                }
            },
            items: [{
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_CLASS + ' label').first();
        const $input = $testContainer.find('input');

        assert.ok($input.attr('id'), 'input has ID');
        assert.equal($label.attr('for'), $input.attr('input'), 'input ID equal to label\'s \'for\' attribute');
    });

    test('Render label with position top render before widget', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    location: 'top'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $fieldItemChildren = $testContainer.find('.' + FIELD_ITEM_CLASS).children();

        assert.ok($fieldItemChildren.first().hasClass(FIELD_ITEM_LABEL_LOCATION_CLASS + 'top'), 'check location class');
        assert.ok($fieldItemChildren.first().is('label'), 'Label is the first child');
    });

    test('Render label with position bottom render after widget', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    location: 'bottom'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $fieldItemChildren = $testContainer.find('.' + FIELD_ITEM_CLASS).children();

        assert.ok($fieldItemChildren.last().hasClass(FIELD_ITEM_LABEL_LOCATION_CLASS + 'bottom'), 'check location class');
        assert.ok($fieldItemChildren.last().is('label'), 'Label is the last child');
    });

    test('Render label with position top and alignment left', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    location: 'top',
                    alignment: 'left'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_CLASS + ' label').first();

        assert.ok($label.parent().hasClass(LABEL_VERTICAL_ALIGNMENT_CLASS), 'Field item contains label that has vertical align');
        assert.equal($label.css('textAlign'), 'left', 'Label has text-align left');
    });

    test('Render label with position top and alignment center', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    location: 'top',
                    alignment: 'center'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_CLASS + ' label').first();

        assert.ok($label.parent().hasClass(LABEL_VERTICAL_ALIGNMENT_CLASS), 'Field item contains label that has vertical align');
        assert.equal($label.css('textAlign'), 'center', 'Label has text-align center');
    });

    test('Render label with position top and alignment right', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    location: 'top',
                    alignment: 'right'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_CLASS + ' label').first();

        assert.ok($label.parent().hasClass(LABEL_VERTICAL_ALIGNMENT_CLASS), 'Field item contains label that has vertical align');
        assert.equal($label.css('textAlign'), 'right', 'Label has text-align right');
    });

    test('Render label with horizontal alignment (left) ', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    location: 'left'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $fieldItem = $testContainer.find('.' + FIELD_ITEM_CLASS).first();

        assert.ok($fieldItem.hasClass(LABEL_HORIZONTAL_ALIGNMENT_CLASS), 'Field item contains label that has horizontal align');
    });

    test('Render label with default position and alignment left', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    alignment: 'left'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_CLASS + ' label').first();

        assert.equal($label.css('textAlign'), 'left', 'Label has text-align left');
    });

    test('Render label with default position and alignment center', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    alignment: 'center'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_CLASS + ' label').first();

        assert.equal($label.css('textAlign'), 'center', 'Label has text-align center');
    });

    test('Render label with showColonAfterLabel', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            showColonAfterLabel: true,
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_LABEL_CLASS).first();

        assert.equal($label.text(), 'Name:', 'text of label');
    });

    test('Label is not rendered when name is defined', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                name: 'name',
                editorType: 'dxTextBox'
            }]
        });

        assert.ok(!$testContainer.find('.' + FIELD_ITEM_LABEL_CLASS).length);
    });

    test('Label is not rendered when labelMode option is not "default"', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            labelMode: 'static',
            items: [{
                label: { text: 'Label text' },
                editorType: 'dxTextBox'
            }]
        });

        assert.notOk($testContainer.find('.' + FIELD_ITEM_LABEL_CLASS).length);
    });

    test('If item is not visible we will not render them', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                dataField: 'firstName'
            }, {
                dataField: 'LastName',
                visible: false
            }, {
                dataField: 'Phone'
            }]
        });
        const $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($fieldItems.length, 2, 'We have only two visible items');
        assert.equal($fieldItems.first().find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'First Name', 'Correct first item rendered');
        assert.equal($fieldItems.last().find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'Phone', 'Correct second item rendered');
    });

    test('Item should be removed from DOM if it\'s visibility changed', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                dataField: 'firstName'
            }, {
                dataField: 'LastName'
            }, {
                dataField: 'Phone'
            }]
        });
        const instance = $testContainer.dxLayoutManager('instance');
        let $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($fieldItems.length, 3, 'We have 3 visible items');

        instance.option('items[1].visible', false);
        $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($fieldItems.length, 2, 'We have 2 visible items');
        assert.equal($fieldItems.first().find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'First Name', 'Correct first item rendered');
        assert.equal($fieldItems.last().find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'Phone', 'Correct second item rendered');
    });

    test('Render items as array of strings', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: ['FirstName', 'LastName']
        });
        const $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($fieldItems.length, 2, 'We have two items');
        assert.equal($fieldItems.first().find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'First Name', 'Correct first item rendered');
        assert.equal($fieldItems.last().find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'Last Name', 'Correct second item rendered');
    });

    test('Render mixed set of items(2 as strings, 1 as object)', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: ['FirstName', {
                dataField: 'Nickname'
            }, 'LastName']
        });
        const $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($fieldItems.length, 3, 'We have three items');
        assert.equal($fieldItems.first().find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'First Name', 'Correct first item rendered');
        assert.equal($fieldItems.eq(1).find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'Nickname', 'Correct second item rendered');
        assert.equal($fieldItems.last().find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'Last Name', 'Correct third item rendered');
    });

    test('If label is not visible we will not render them', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                dataField: 'firstName',
                label: {
                    visible: false
                }
            }]
        });
        const $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($fieldItems.length, 1, 'We have only one item');
        assert.equal($fieldItems.find('.' + FIELD_ITEM_LABEL_CLASS).length, 0, 'We have\'t labels');
        assert.equal($fieldItems.find('.' + FIELD_ITEM_CONTENT_CLASS).length, 1, 'We have widget in field');
    });

    test('Render label with horizontal alignment (right) ', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    location: 'right'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $fieldItem = $testContainer.find('.' + FIELD_ITEM_CLASS).first();

        assert.ok($fieldItem.find('.' + FIELD_ITEM_LABEL_CLASS).hasClass(FIELD_ITEM_LABEL_LOCATION_CLASS + 'right'), 'check location class');
        assert.ok($fieldItem.hasClass(LABEL_HORIZONTAL_ALIGNMENT_CLASS), 'Field item contains label that has horizontal align');
    });

    test('Default render with label', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            showColonAfterLabel: true,
            items: [{
                label: {
                    text: 'New label'
                },
                dataField: 'name',
                editorType: 'dxTextBox'

            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_CLASS + ' label').first();

        assert.equal($label.text(), 'New label:', 'text of label');
    });

    test('Colon symbol is not added to label when showColon is disabled for label', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            showColonAfterLabel: true,
            items: [{
                label: {
                    text: 'New label',
                    showColon: false
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $label = $testContainer.find('.' + FIELD_ITEM_CLASS + ' label').first();

        assert.equal($label.text(), 'New label', 'text of label');
    });

    test('Render editor with id attribute', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            form: {
                option: () => {},
                getItemID: () => {
                    return 'dx_FormID_name';
                }
            },
            items: [{
                label: {
                    text: 'New label'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $input = $testContainer.find('.' + FIELD_ITEM_CLASS + ' .dx-texteditor input').first();

        assert.equal($input.attr('id'), 'dx_FormID_name', 'id attr of input');
    });

    test('Render editor by default is data is unknown', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            layoutData: {
                Name: null
            }
        });

        const $editor = $testContainer.find('.dx-texteditor');
        assert.equal($editor.length, 1, 'render 1 editor');
        assert.ok($editor.hasClass('dx-textbox'), 'It is dxTextBox by default');
    });

    test('Generate several items in layout', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    text: 'label1'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }, {
                label: {
                    text: 'label2'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }, {
                label: {
                    text: 'label3'
                },
                dataField: 'name',
                editorType: 'dxTextBox'
            }]
        });
        const $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);


        assert.equal($fieldItems.length, 3, 'Render 3 items');
        for(let i = 0; i < 3; i++) {
            const labelCount = i + 1;

            assert.equal($fieldItems.eq(i).find('label').text(), 'label' + labelCount, 'Label' + labelCount);
        }
    });

    test('Generate items from layoutData', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date()
            }
        }).dxLayoutManager('instance');

        assert.deepEqual(layoutManager._items, [{
            dataField: 'name',
            editorType: 'dxTextBox',
            itemType: 'simple',
            visibleIndex: 0,
            col: 0
        }, {
            dataField: 'active',
            editorType: 'dxCheckBox',
            allowIndeterminateState: true,
            itemType: 'simple',
            visibleIndex: 1,
            col: 0
        }, {
            dataField: 'price',
            editorType: 'dxNumberBox',
            itemType: 'simple',
            visibleIndex: 2,
            col: 0
        }, {
            dataField: 'birthDate',
            editorType: 'dxDateBox',
            itemType: 'simple',
            visibleIndex: 3,
            col: 0
        }]);
    });

    test('Generate items from layoutData with unacceptable data', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                name: 'John',
                wrongField: () => {}
            }
        }).dxLayoutManager('instance');

        assert.deepEqual(layoutManager._items, [{
            dataField: 'name',
            editorType: 'dxTextBox',
            itemType: 'simple',
            visibleIndex: 0,
            col: 0
        }]);
    });

    test('Generate items from layoutData and items', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date('01/01/2000')
            },
            items: [{
                dataField: 'active',
                editorType: 'dxSwitch'
            }, {
                dataField: 'secondName',
                editorType: 'dxTextArea'
            }]
        }).dxLayoutManager('instance');

        assert.deepEqual(layoutManager._items, [{
            dataField: 'active',
            editorType: 'dxSwitch',
            itemType: 'simple',
            visibleIndex: 0,
            col: 0
        }, {
            dataField: 'secondName',
            editorType: 'dxTextArea',
            itemType: 'simple',
            visibleIndex: 1,
            col: 0
        }]);

        assert.deepEqual(
            layoutManager.option('layoutData'), {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date('01/01/2000')
            },
            'Correct Data'
        );
    });

    test('Check data when generate items from layoutData and items with initial value', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date('01/01/2000')
            },
            items: [{
                dataField: 'active',
                editorType: 'dxSwitch'
            }, {
                dataField: 'secondName',
                editorType: 'dxTextArea',
                editorOptions: {
                    value: 'Test'
                }
            }]
        }).dxLayoutManager('instance');

        assert.deepEqual(
            layoutManager.option('layoutData'), {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date('01/01/2000'),
                secondName: 'Test'
            },
            'Correct Data'
        );
    });

    test('Rerender items after change \'items\' option', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: [{
                label: {
                    text: 'label1'
                },
                dataField: 'field1',
                editorType: 'dxTextBox'
            }]
        });
        const layoutManager = $testContainer.dxLayoutManager('instance');

        layoutManager.option('items', [{
            label: {
                text: 'label1'
            },
            dataField: 'field2',
            editorType: 'dxNumberBox'
        }, {
            label: {
                text: 'label2'
            },
            dataField: 'field3',
            editorType: 'dxDateBox'
        }]);

        const $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.ok($fieldItems.eq(0).find('.dx-numberbox').length, 'First item is dxNumberBox');
        assert.ok($fieldItems.eq(1).find('.dx-datebox').length, 'Second item is dxDateBox');
    });

    test('Generate items after change \'layoutData\' option', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date()
            }
        }).dxLayoutManager('instance');

        layoutManager.option('layoutData', {
            title: 'Test',
            room: 1001,
            startDate: new Date()
        });

        assert.deepEqual(layoutManager._items, [{
            dataField: 'title',
            editorType: 'dxTextBox',
            itemType: 'simple',
            visibleIndex: 0,
            col: 0
        }, {
            dataField: 'room',
            editorType: 'dxNumberBox',
            itemType: 'simple',
            visibleIndex: 1,
            col: 0
        }, {
            dataField: 'startDate',
            editorType: 'dxDateBox',
            itemType: 'simple',
            visibleIndex: 2,
            col: 0
        }]);
    });

    test('Set values from layoutData', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date('10/10/2010')
            }
        });

        const $editors = $testContainer.find('.dx-texteditor, .dx-checkbox');

        assert.equal($editors.eq(0).dxTextBox('instance').option('value'), 'Patti', '1 editor');
        assert.equal($editors.eq(1).dxCheckBox('instance').option('value'), true, '2 editor');
        assert.equal($editors.eq(2).dxNumberBox('instance').option('value'), 1200, '3 editor');
        assert.deepEqual($editors.eq(3).dxDateBox('instance').option('value'), new Date('10/10/2010'), '4 editor');
    });

    test('Value from layoutData shouldn\'t pass to the editor in case when the \'dataField\' options isn\'t specified', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                firstName: 'Alex',
            },
            items: [{
                name: 'firstName',
                editorType: 'dxTextBox'
            }]
        });

        const editor = $testContainer.find('.dx-texteditor').dxTextBox('instance');

        assert.equal(editor.option('value'), null, 'Editor hasn\'t a value');
    });

    test('layoutData isn\'t updating on editor value change if the \'dataField\' option isn\'t specified', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                firstName: 'Alex',
            },
            items: [{
                name: 'firstName',
                editorType: 'dxTextBox'
            }]
        });

        $testContainer.find('.dx-texteditor').dxTextBox('option', 'value', 'John');

        const layoutManager = $testContainer.dxLayoutManager('instance');
        assert.deepEqual(layoutManager.option('layoutData'), {
            firstName: 'Alex'
        }, 'layoutData keeps the same data');
    });

    test('Set value via editor options', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date('10/10/2010')
            },
            customizeItem: (item) => {
                if(item.dataField === 'price') {
                    item.editorOptions = {
                        value: 34
                    };
                }
            }
        });

        const $editors = $testContainer.find('.dx-texteditor, .dx-checkbox');

        assert.equal($editors.eq(2).dxNumberBox('instance').option('value'), 34);
    });

    test('Change item.visible on customizeItem works correct', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Michael',
                age: 20
            },
            customizeItem: (item) => {
                if(item.dataField === 'name') {
                    item.visible = false;
                }
            }
        });

        const $editors = $testContainer.find('.dx-texteditor');

        assert.equal($editors.length, 1, 'There is only one editor');
        assert.equal($testContainer.find('.' + FIELD_ITEM_LABEL_CLASS).text(), 'Age', 'Correct field rendered');
    });

    test('CustomizeItem work well after option change', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Patti',
                gender: true,
                price: 1200,
                birthDate: new Date('10/10/2010')
            }
        });

        $testContainer.dxLayoutManager('instance').option('customizeItem',
            (item) => {
                if(item.dataField === 'price') {
                    item.editorOptions = {
                        value: 34
                    };
                }
            }
        );

        const $editors = $testContainer.find('.dx-texteditor, .dx-checkbox');

        assert.equal($editors.eq(2).dxNumberBox('instance').option('value'), 34);
    });

    test('Get value from editor', function(assert) {
        const $testContainer = $('#container');

        const layoutManager = $testContainer.dxLayoutManager({
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox'
            }, {
                dataField: 'active',
                editorType: 'dxCheckBox'
            }, {
                dataField: 'price',
                editorType: 'dxNumberBox'
            }, {
                dataField: 'birthDate',
                editorType: 'dxDateBox'
            }]
        }).dxLayoutManager('instance');

        const $editors = $testContainer.find('.dx-texteditor, .dx-checkbox');
        $editors.eq(0).dxTextBox('instance').option('value', 'Fillip');
        $editors.eq(1).dxCheckBox('instance').option('value', true);
        $editors.eq(2).dxNumberBox('instance').option('value', 7);
        $editors.eq(3).dxDateBox('instance').option('value', '10/10/2001');

        assert.deepEqual(layoutManager.option('layoutData'), {
            name: 'Fillip',
            active: true,
            price: 7,
            birthDate: '10/10/2001'
        });
    });

    test('Editors with object value correctly work with values from data', function(assert) {
        const $testContainer = $('#container');
        const items = [{
            myText: 'test1',
            number: 1
        }, {
            myText: 'test2',
            number: 2
        }, {
            myText: 'test3',
            number: 3
        }];

        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: {
                testItem: items[1]
            },
            items: [{
                dataField: 'testItem',
                editorType: 'dxLookup',
                editorOptions: {
                    items: items,
                    displayExpr: 'myText'
                }
            }]
        }).dxLayoutManager('instance');

        const lookupCurrentItemText = layoutManager.$element().find('.dx-lookup-field').text();

        assert.equal(lookupCurrentItemText, 'test2', 'lookup has correct current item');
    });

    test('A layoutData object change at changing widget from items option', function(assert) {
        const $testContainer = $('#container');

        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date('10/10/2010')
            },
            items: [{
                dataField: 'subscribe',
                editorType: 'dxCheckBox'
            }]
        }).dxLayoutManager('instance');

        $testContainer.find('.dx-checkbox').dxCheckBox('instance').option('value', true);

        assert.deepEqual(layoutManager.option('layoutData'), {
            name: 'Patti',
            active: true,
            price: 1200,
            birthDate: new Date('10/10/2010'),
            subscribe: true
        }, 'Custom field data updated');
    });

    test('A layoutData is not changed when dataField is undefined_T310737', function(assert) {
        const $testContainer = $('#container');

        const layoutManager = $testContainer.dxLayoutManager({
            items: [{
                editorType: 'dxTextBox'
            }, {
                editorType: 'dxTextBox'
            }, {
                editorType: 'dxTextBox'
            }]
        }).dxLayoutManager('instance');

        const $textBoxes = $testContainer.find('.dx-textbox');
        const textBoxes = [];

        textBoxes[0] = $textBoxes.eq(0).dxTextBox('instance');
        textBoxes[1] = $textBoxes.eq(1).dxTextBox('instance');
        textBoxes[2] = $textBoxes.eq(2).dxTextBox('instance');

        textBoxes[0].option('value', 'test1');
        textBoxes[1].option('value', 'test2');
        textBoxes[2].option('value', 'test3');

        assert.deepEqual(layoutManager.option('layoutData'), {}, 'layout data');
        assert.equal(textBoxes[0].option('value'), 'test1', 'editor 1');
        assert.equal(textBoxes[1].option('value'), 'test2', 'editor 2');
        assert.equal(textBoxes[2].option('value'), 'test3', 'editor 3');
    });

    test('Set \'disabled\' option to layoutManager and check internal element state', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Patti',
                active: true,
                price: 1200,
                birthDate: new Date('10/10/2010')
            }
        });

        $testContainer.dxLayoutManager('instance').option('disabled', true);
        const $editors = $testContainer.find('.dx-texteditor, .dx-checkbox');

        assert.equal($editors.eq(0).dxTextBox('instance').option('disabled'), true);
        assert.equal($editors.eq(1).dxCheckBox('instance').option('disabled'), true);
        assert.equal($editors.eq(2).dxNumberBox('instance').option('disabled'), true);
        assert.equal($editors.eq(3).dxDateBox('instance').option('disabled'), true);
    });

    test('Label creates when item has no name but has \'label.text\' option', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                editorType: 'dxTextBox',
                label: {
                    text: 'NewLabel'
                }
            }]
        });

        const $label = $testContainer.find('label');

        assert.ok($label.length, 'Editor has label');
        assert.equal($label.text(), 'NewLabel', 'Correct label\'s text');
    });

    test('Render field items from fieldData and items', function(assert) {
        const $testContainer = $('#container');
        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Patti'
            },
            items: [{
                editorType: 'dxButton'
            }]
        }).dxLayoutManager('instance');

        assert.equal(layoutManager._items.length, 1, 'LayoutManager has 2 fields');
        assert.ok($testContainer.find('.dx-button').length, 'Form has button');
    });

    test('Render field items from fieldData and items when fieldData is a complex object', function(assert) {
        const $testContainer = $('#container');
        const complexObject = {
            CTO: {
                name: 'Alex',
                age: 40
            },
            CEO: {
                name: 'George',
                age: 34
            }
        };
        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: complexObject,
            items: [{
                dataField: 'CTO.name',
                editorType: 'dxTextBox'
            }, {
                dataField: 'CEO.name',
                editorType: 'dxTextBox'
            }]
        }).dxLayoutManager('instance');

        const $labels = $testContainer.find('label');
        const $inputs = $testContainer.find('input');

        assert.equal(layoutManager._items.length, 2, 'LayoutManager has 2 fields');

        assert.equal($labels.length, 2, 'Form has 2 labels');
        assert.equal($labels.eq(0).text(), 'CTO name', 'First label text');
        assert.equal($labels.eq(1).text(), 'CEO name', 'Second label text');


        assert.equal($inputs.length, 2, 'Form has 2 inputs');
        assert.equal($inputs.eq(0).val(), 'Alex', 'First input value');
        assert.equal($inputs.eq(1).val(), 'George', 'Second input value');
    });

    test('Render field items from fieldData and items when fieldData is a complex object and custom label text', function(assert) {
        const $testContainer = $('#container');
        const complexObject = {
            CTO: {
                name: 'Alex',
                age: 40
            },
            CEO: {
                name: 'George',
                age: 34
            }
        };
        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: complexObject,
            items: [{
                dataField: 'CTO.name',
                label: {
                    text: 'The smartest CTO'
                }
            }, {
                dataField: 'CEO.name',
                label: {
                    text: 'The best CEO'
                },
                editorType: 'dxTextBox'
            }]
        }).dxLayoutManager('instance');

        const $labels = $testContainer.find('label');
        const $inputs = $testContainer.find('input');

        assert.equal(layoutManager._items.length, 2, 'LayoutManager has 2 fields');

        assert.equal($labels.length, 2, 'Form has 2 labels');
        assert.equal($labels.eq(0).text(), 'The smartest CTO', 'First label text');
        assert.equal($labels.eq(1).text(), 'The best CEO', 'Second label text');


        assert.equal($inputs.length, 2, 'Form has 2 inputs');
        assert.equal($inputs.eq(0).val(), 'Alex', 'First input value');
        assert.equal($inputs.eq(1).val(), 'George', 'Second input value');
    });

    test('Render help text', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [
                { dataField: 'field1', helpText: 'field1 help text' },
                { dataField: 'field1', helpText: null },
                { dataField: 'field1', helpText: undefined },
                'field3',
                { dataField: 'field2' },
                { itemType: 'empty', helpText: 'should be rendered for simple only' },
                { itemType: 'group', helpText: 'should be rendered for simple only' },
                { itemType: 'tabbed', helpText: 'should be rendered for simple only' },
                { itemType: 'button', helpText: 'should be rendered for simple only' },
            ]
        });

        const $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($testContainer.find('.' + FIELD_ITEM_CONTENT_WRAPPER_CLASS).length, 1, 'FIELD_ITEM_CONTENT_WRAPPER_CLASS.length');
        assert.equal($testContainer.find('.' + FIELD_ITEM_HELP_TEXT_CLASS).length, 1, 'FIELD_ITEM_HELP_TEXT_CLASS.length');

        const $fieldHelpText = $fieldItems.eq(0).find('>.' + FIELD_ITEM_CONTENT_WRAPPER_CLASS + '>.' + FIELD_ITEM_HELP_TEXT_CLASS + ':last-child');
        assert.equal($fieldHelpText.length, 1, '$field1HelpText.length');
        assert.equal($fieldHelpText.text(), 'field1 help text');
    });

    test('Change the order of items', function(assert) {
        const $testContainer = $('#container');
        const data = {
            name: 'Alex',
            age: 40,
            gender: 'male'
        };

        $testContainer.dxLayoutManager({
            layoutData: data,
            items: [{
                visibleIndex: 1,
                dataField: 'name',
                editorType: 'dxTextBox'
            }, {
                visibleIndex: 2,
                dataField: 'age',
                editorType: 'dxTextBox'
            }, {
                visibleIndex: 0,
                dataField: 'gender',
                editorType: 'dxTextBox'
            }]
        });

        const $labels = $testContainer.find('label');
        const $inputs = $testContainer.find('input');

        assert.equal($labels.length, 3, 'Form has 3 labels');
        assert.equal($labels.eq(0).text(), 'Gender', 'First label text');
        assert.equal($labels.eq(1).text(), 'Name', 'Second label text');
        assert.equal($labels.eq(2).text(), 'Age', 'Second label text');

        assert.equal($inputs.length, 3, 'Form has 3 inputs');
        assert.equal($inputs.eq(0).val(), 'male', 'First input value');
        assert.equal($inputs.eq(1).val(), 'Alex', 'Second input value');
        assert.equal($inputs.eq(2).val(), '40', 'First input value');
    });

    test('Change the order of items with items without visibleIndex', function(assert) {
        const $testContainer = $('#container');
        const data = {
            name: 'Alex',
            age: 40,
            gender: 'male',
            hasAuto: 'Yes'
        };

        $testContainer.dxLayoutManager({
            layoutData: data,
            items: [{
                dataField: 'name',
                editorType: 'dxTextBox'
            }, {
                visibleIndex: 0,
                dataField: 'age',
                editorType: 'dxTextBox'
            }, {
                dataField: 'gender',
                editorType: 'dxTextBox'
            }, {
                visibleIndex: 1,
                dataField: 'hasAuto',
                editorType: 'dxTextBox'
            }]
        });

        const $labels = $testContainer.find('label');
        const $inputs = $testContainer.find('input');

        assert.equal($labels.length, 4, 'Form has 4 labels');
        assert.equal($labels.eq(0).text(), 'Age', 'First label text');
        assert.equal($labels.eq(1).text(), 'Has Auto', 'Second label text');
        assert.equal($labels.eq(2).text(), 'Name', 'Third label text');
        assert.equal($labels.eq(3).text(), 'Gender', 'Fourth label text');

        assert.equal($inputs.eq(0).val(), '40', 'First input value');
        assert.equal($inputs.eq(1).val(), 'Yes', 'Second input value');
        assert.equal($inputs.eq(2).val(), 'Alex', 'Second input value');
        assert.equal($inputs.eq(3).val(), 'male', 'Second input value');
    });

    test('Update editor with nested dataField when layoutData changed', function(assert) {
        const $testContainer = $('#container');
        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: {
                personalInfo: {
                    firstName: 'John'
                }
            },
            items: ['personalInfo.firstName']
        }).dxLayoutManager('instance');

        layoutManager.option('layoutData', {
            personalInfo: {
                firstName: 'Jane'
            }
        });

        assert.equal(layoutManager.getEditor('personalInfo.firstName').option('value'), 'Jane', 'Editor is up to date');
    });

    test('Render empty item', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            formData: {
                name: 'Test Name',
                profession: 'Test profession'
            },
            items: ['name', {
                itemType: 'empty'
            }, 'profession']
        });

        assert.equal($testContainer.find('.' + FIELD_EMPTY_ITEM_CLASS).length, 1);
    });

    test('layoutData with \'null\' fields shouldn\'t reset editor\'s \'isValid\' option', function(assert) {
        const instance = $('#container').dxLayoutManager({
            layoutData: {
                test1: 'test1',
                test2: 'test2'
            },
            items: [{
                dataField: 'test1',
                editorOptions: {
                    isValid: false
                }
            }, {
                dataField: 'test2',
                editorOptions: {
                    isValid: false
                }
            }]
        }).dxLayoutManager('instance');

        instance.option('layoutData', {
            test1: '',
            test2: null
        });

        const textBox = instance.getEditor('test1');
        const dateBox = instance.getEditor('test2');
        assert.notOk(textBox.option('isValid'), '\'isValid\' is false');
        assert.equal(textBox.option('value'), '', 'Value is empty string');
        assert.notOk(dateBox.option('isValid'), '\'isValid\' is false');
        assert.equal(dateBox.option('value'), null, 'Value is null');
    });

    test('Render with empty items', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            formData: {
                name: 'Test Name'
            },
            items: []
        }).dxLayoutManager('instance');

        assert.equal(layoutManager.$element().children().length, 0, 'layout manager content is empty');
        assert.notOk(layoutManager.getEditor('name'), 'editor is not created');
    });
});

QUnit.module('Render multiple columns', () => {
    test('Render layoutManager with 2 columns', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: createTestObject(),
            colCount: 2,
            height: 800
        }).dxLayoutManager('instance');
        const responsiveBox = $('#container').find('.dx-responsivebox').dxResponsiveBox('instance');
        const boxItems = responsiveBox.option('items');

        assert.equal(layoutManager._items.length, $('#container .dx-texteditor').length, 'generated items');
        assert.deepEqual(boxItems[0].location, {
            col: 0,
            row: 0
        }, 'col 0 row 0');
        assert.deepEqual(boxItems[1].location, {
            col: 1,
            row: 0
        }, 'col 1 row 0');
        assert.deepEqual(boxItems[2].location, {
            col: 0,
            row: 1
        }, 'col 0 row 1');
        assert.deepEqual(boxItems[3].location, {
            col: 1,
            row: 1
        }, 'col 1 row 1');
        assert.deepEqual(boxItems[4].location, {
            col: 0,
            row: 2
        }, 'col 0 row 2');
        assert.deepEqual(boxItems[5].location, {
            col: 1,
            row: 2
        }, 'col 1 row 2');
        assert.deepEqual(boxItems[6].location, {
            col: 0,
            row: 3
        }, 'col 0 row 3');
        assert.deepEqual(boxItems[7].location, {
            col: 1,
            row: 3
        }, 'col 1 row 3');
        assert.deepEqual(boxItems[8].location, {
            col: 0,
            row: 4
        }, 'col 0 row 4');
        assert.deepEqual(boxItems[9].location, {
            col: 1,
            row: 4
        }, 'col 1 row 4');
        assert.deepEqual(boxItems[10].location, {
            col: 0,
            row: 5
        }, 'col 0 row 5');
    });

    test('Render layout items in order', function(assert) {
        $('#container').dxLayoutManager({
            layoutData: {
                name: 'Patti',
                address: 'Test town',
                room: 101,
                gender: 'male',
                id: 'test id'
            },
            colCount: 2,
            height: 800
        });
        const $labels = $('#container .dx-responsivebox label');
        const $editors = $('#container .dx-responsivebox .dx-texteditor-input');


        assert.equal($labels.eq(0).text(), 'Name', '0 label');
        assert.equal($labels.eq(1).text(), 'Address', '1 label');
        assert.equal($labels.eq(2).text(), 'Room', '2 label');
        assert.equal($labels.eq(3).text(), 'Gender', '3 label');
        assert.equal($labels.eq(4).text(), 'Id', '4 label');

        assert.equal($editors.eq(0).val(), 'Patti', '0 input');
        assert.equal($editors.eq(1).val(), 'Test town', '1 input');
        assert.equal($editors.eq(2).val(), '101', '2 input');
        assert.equal($editors.eq(3).val(), 'male', '3 input');
        assert.equal($editors.eq(4).val(), 'test id', '4 input');
    });

    test('Check that layoutManager create correct rows count', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: createTestObject(),
            colCount: 2,
            height: 800
        }).dxLayoutManager('instance');

        assert.equal(layoutManager._getRowsCount(), 6, '11 items / 2 columns = 6 rows');
    });

    test('Check rows and cols in responsiveBox', function(assert) {
        $('#container').dxLayoutManager({
            layoutData: createTestObject(),
            colCount: 2,
            height: 800
        });

        const responsiveBox = $('#container').find('.dx-responsivebox').dxResponsiveBox('instance');

        assert.equal(responsiveBox.option('cols').length, 2, 'cols count');
        assert.equal(responsiveBox.option('rows').length, 6, 'rows count');
    });

    test('Prepare items for col span', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: createTestObject(),
            colCount: 4,
            height: 800,
            customizeItem: (item) => {
                switch(item.dataField) {
                    case 'FirstName':
                    case 'LastName':
                        item.colSpan = 2;
                        break;
                    case 'Prefix':
                        item.colSpan = 4;
                        break;
                    case 'Notes':
                        item.colSpan = 5;
                        break;
                    case 'StateID':
                        item.colSpan = 3;
                        break;
                    default:
                }
            }
        }).dxLayoutManager('instance');
        const items = layoutManager._items;


        assert.equal(items.length, 15, 'items count');
        assert.deepEqual(items[0], {
            dataField: 'ID',
            editorType: 'dxNumberBox',
            visibleIndex: 0,
            col: 0,
            itemType: 'simple'
        }, '0 item');
        assert.deepEqual(items[1], {
            dataField: 'FirstName',
            colSpan: 2,
            editorType: 'dxTextBox',
            visibleIndex: 1,
            col: 1,
            itemType: 'simple'
        }, '1 item');
        assert.deepEqual(items[2], {
            merged: true
        }, '2 item, merged');
        assert.deepEqual(items[3], {
            dataField: 'LastName',
            editorType: 'dxTextBox',
            visibleIndex: 2,
            col: 3,
            itemType: 'simple'
        }, '3 item');
        assert.deepEqual(items[4], {
            dataField: 'Prefix',
            colSpan: 4,
            editorType: 'dxTextBox',
            visibleIndex: 3,
            col: 0,
            itemType: 'simple'
        }, '5 item');
        assert.deepEqual(items[5], {
            merged: true
        }, '6 item, merged');
        assert.deepEqual(items[6], {
            merged: true
        }, '7 item, merged');
        assert.deepEqual(items[7], {
            merged: true
        }, '8 item, merged');
        assert.deepEqual(items[8], {
            dataField: 'Position',
            editorType: 'dxTextBox',
            visibleIndex: 4,
            col: 0,
            itemType: 'simple'
        }, '9 item');
        assert.deepEqual(items[9], {
            dataField: 'Picture',
            editorType: 'dxTextBox',
            visibleIndex: 5,
            col: 1,
            itemType: 'simple'
        }, '10 item');
        assert.deepEqual(items[10], {
            dataField: 'BirthDate',
            editorType: 'dxTextBox',
            visibleIndex: 6,
            col: 2,
            itemType: 'simple'
        }, '11 item');
        assert.deepEqual(items[11], {
            dataField: 'HireDate',
            editorType: 'dxTextBox',
            visibleIndex: 7,
            col: 3,
            itemType: 'simple'
        }, '12 item');
        assert.deepEqual(items[12], {
            dataField: 'Notes',
            editorType: 'dxTextBox',
            visibleIndex: 8,
            col: 0,
            itemType: 'simple'
        }, '13 item');
        assert.deepEqual(items[13], {
            dataField: 'Address',
            editorType: 'dxTextBox',
            visibleIndex: 9,
            col: 1,
            itemType: 'simple'
        }, '14 item');
        assert.deepEqual(items[14], {
            dataField: 'StateID',
            editorType: 'dxNumberBox',
            visibleIndex: 10,
            col: 2,
            itemType: 'simple'
        }, '15 item');
    });

    test('Generate layout items for col span', function(assert) {
        $('#container').dxLayoutManager({
            layoutData: createTestObject(),
            colCount: 4,
            height: 800,
            customizeItem: (item) => {
                switch(item.dataField) {
                    case 'LastName':
                    case 'FirstName':
                        item.colSpan = 2;
                        break;
                    case 'Prefix':
                        item.colSpan = 4;
                        break;
                    case 'StateID':
                        item.colSpan = 3;
                        break;
                }
            }
        }).dxLayoutManager('instance');

        const responsiveBox = $('.dx-responsivebox').dxResponsiveBox('instance');
        const items = responsiveBox.option('items');


        assert.equal(items.length, 11, 'responsiveBox items count');
        assert.equal(items[0].location.colspan, undefined, 'ID has no colSpan');
        assert.equal(items[1].location.colspan, 2, 'FirstName has colSpan');
        assert.equal(items[2].location.colspan, undefined, 'LastName has no colSpan');
        assert.equal(items[3].location.colspan, 4, 'Prefix has colSpan');
        assert.equal(items[4].location.colspan, undefined, 'Position has no colSpan');
        assert.equal(items[5].location.colspan, undefined, 'Picture has no colSpan');
        assert.equal(items[6].location.colspan, undefined, 'BirthDate has no colSpan');
        assert.equal(items[7].location.colspan, undefined, 'HireDate has no colSpan');
        assert.equal(items[8].location.colspan, undefined, 'Notes has no colSpan');
        assert.equal(items[9].location.colspan, undefined, 'Address has no colSpan');
        assert.equal(items[10].location.colspan, undefined, 'StateID has no colSpan');
    });

    test('Prepare items for col span when labelLocation is \'top\' (T307223)', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: createTestObject(),
            colCount: 4,
            labelLocation: 'top',
            height: 800,
            customizeItem: (item) => {
                switch(item.dataField) {
                    case 'FirstName':
                    case 'LastName':
                        item.colSpan = 2;
                        break;
                    case 'Prefix':
                        item.colSpan = 4;
                        break;
                    case 'Notes':
                        item.colSpan = 5;
                        break;
                    case 'StateID':
                        item.colSpan = 3;
                        break;
                    default:
                }
            }
        }).dxLayoutManager('instance');
        const items = layoutManager._items;


        assert.equal(items.length, 15, 'items count');
        assert.deepEqual(items[0], {
            dataField: 'ID',
            editorType: 'dxNumberBox',
            visibleIndex: 0,
            col: 0,
            itemType: 'simple'
        }, '0 item');
        assert.deepEqual(items[1], {
            dataField: 'FirstName',
            colSpan: 2,
            editorType: 'dxTextBox',
            visibleIndex: 1,
            col: 1,
            itemType: 'simple'
        }, '1 item');
        assert.deepEqual(items[2], {
            merged: true
        }, '2 item, merged');
        assert.deepEqual(items[3], {
            dataField: 'LastName',
            editorType: 'dxTextBox',
            visibleIndex: 2,
            col: 3,
            itemType: 'simple'
        }, '3 item');
        assert.deepEqual(items[4], {
            dataField: 'Prefix',
            colSpan: 4,
            editorType: 'dxTextBox',
            visibleIndex: 3,
            col: 0,
            itemType: 'simple'
        }, '5 item');
        assert.deepEqual(items[5], {
            merged: true
        }, '6 item, merged');
        assert.deepEqual(items[6], {
            merged: true
        }, '7 item, merged');
        assert.deepEqual(items[7], {
            merged: true
        }, '8 item, merged');
        assert.deepEqual(items[8], {
            dataField: 'Position',
            editorType: 'dxTextBox',
            visibleIndex: 4,
            col: 0,
            itemType: 'simple'
        }, '9 item');
        assert.deepEqual(items[9], {
            dataField: 'Picture',
            editorType: 'dxTextBox',
            visibleIndex: 5,
            col: 1,
            itemType: 'simple'
        }, '10 item');
        assert.deepEqual(items[10], {
            dataField: 'BirthDate',
            editorType: 'dxTextBox',
            visibleIndex: 6,
            col: 2,
            itemType: 'simple'
        }, '11 item');
        assert.deepEqual(items[11], {
            dataField: 'HireDate',
            editorType: 'dxTextBox',
            visibleIndex: 7,
            col: 3,
            itemType: 'simple'
        }, '12 item');
        assert.deepEqual(items[12], {
            dataField: 'Notes',
            editorType: 'dxTextBox',
            visibleIndex: 8,
            col: 0,
            itemType: 'simple'
        }, '13 item');
        assert.deepEqual(items[13], {
            dataField: 'Address',
            editorType: 'dxTextBox',
            visibleIndex: 9,
            col: 1,
            itemType: 'simple'
        }, '14 item');
        assert.deepEqual(items[14], {
            dataField: 'StateID',
            editorType: 'dxNumberBox',
            visibleIndex: 10,
            col: 2,
            itemType: 'simple'
        }, '15 item');
    });

    test('Generate rows ratio for col span', function(assert) {
        $('#container').dxLayoutManager({
            layoutData: createTestObject(),
            colCount: 4,
            height: 800,
            customizeItem: (item) => {
                switch(item.dataField) {
                    case 'LastName':
                    case 'FirstName':
                        item.colSpan = 2;
                        break;
                    case 'Prefix':
                        item.colSpan = 4;
                        break;
                    case 'StateID':
                        item.colSpan = 3;
                        break;
                }
            }
        }).dxLayoutManager('instance');

        const responsiveBox = $('.dx-responsivebox').dxResponsiveBox('instance');
        const rows = responsiveBox.option('rows');


        assert.equal(rows.length, 4);
    });

    test('Change of editor\'s value changing \'layoutData\' option', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                FamousPirate: 'John Morgan'
            }
        });

        $testContainer.find('.dx-textbox').dxTextBox('instance').option('value', 'Cpt. Jack Sparrow');

        assert.deepEqual($testContainer.dxLayoutManager('instance').option('layoutData'), {
            FamousPirate: 'Cpt. Jack Sparrow'
        }, 'Correct layoutData');
    });

    test('Change of editor\'s value changing \'items.editorOptions.value\' option', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                dataField: 'FamousPirate',
                editorType: 'dxTextBox',
                editorOptions: {
                    value: 'John Morgan'
                }
            }]
        });

        $testContainer.find('.dx-textbox').dxTextBox('instance').option('value', 'Cpt. Jack Sparrow');

        assert.deepEqual($testContainer.dxLayoutManager('instance').option('layoutData'), {
            'FamousPirate': 'Cpt. Jack Sparrow'
        }, 'Correct layoutData');
    });

    test('Render when \'colCount\' is \'auto\' and have 1 item', function(assert) {
        const $testContainer = $('#container').width(450);

        $testContainer.dxLayoutManager({
            layoutData: {
                test: 'abc'
            },
            colCount: 'auto',
            minColWidth: 200
        });

        const instance = $testContainer.dxLayoutManager('instance');
        const colCount = instance._getColCount();

        assert.equal(colCount, 1, 'We have only 1 column, because have only one item');
    });

    test('Correct colCount when width is less that minColWidth and colCount is auto', function(assert) {
        const $testContainer = $('#container').width(450);

        $testContainer.dxLayoutManager({
            layoutData: {
                test: 'abc'
            },
            colCount: 'auto',
            minColWidth: 200,
            width: 100
        });

        const instance = $testContainer.dxLayoutManager('instance');
        const colCount = instance._getColCount();

        assert.equal(colCount, 1, 'Correct colCount');
    });

    test('Render when \'colCount\' is \'auto\' and have 3 items', function(assert) {
        const $testContainer = $('#container').width(450);

        $testContainer.dxLayoutManager({
            layoutData: {
                test1: 'abc',
                test2: 'qwe',
                test3: 'xyz'
            },
            colCount: 'auto',
            minColWidth: 200
        });

        const instance = $testContainer.dxLayoutManager('instance');
        const colCount = instance._getColCount();
        const expectedColCount = windowUtils.hasWindow() ? 2 : 1;

        assert.equal(colCount, expectedColCount, 'We have only 2 columns');
    });

    test('Change minColWidth when colCount is auto', function(assert) {
        const $testContainer = $('#container').width(450);

        $testContainer.dxLayoutManager({
            layoutData: {
                test1: 'abc',
                test2: 'qwe',
                test3: 'xyz'
            },
            colCount: 1,
            minColWidth: 200
        });

        const instance = $testContainer.dxLayoutManager('instance');
        const invalidateStub = sinon.stub(instance, '_invalidate');

        instance.option('minColWidth', 100);
        assert.equal(invalidateStub.callCount, 0, 'Invalidate is not fired, because colCount is not auto');


        instance.option('colCount', 'auto');
        instance.option('minColWidth', 300);

        assert.equal(instance._getColCount(), 1, 'We have only 1 column');
        assert.equal(invalidateStub.callCount, 2, 'Invalidate fire 2 times, change colCount and change minColWidth');
        invalidateStub.restore();
    });

    test('Clear item watchers after disposing', function(assert) {
        const $testContainer = $('#container').width(450);

        $testContainer.dxLayoutManager({
            layoutData: {
                test1: 'abc',
                test2: 'qwe',
                test3: 'xyz'
            }
        });

        const instance = $testContainer.dxLayoutManager('instance');
        const cleanWatcherStub = sinon.stub(instance, '_cleanItemWatchers');

        instance.$element().remove();
        assert.equal(cleanWatcherStub.callCount, 1, '_cleanItemWatchers is fired');

        cleanWatcherStub.restore();
    });

    test('Render validate', function(assert) {
        const $container = $('#container');

        $container.dxLayoutManager({
            layoutData: createTestObject(),
            colCount: 4,
            height: 800,
            form: {
                option: () => {},
                getItemID: (name) => {
                    return 'dx_FormID_' + name;
                }
            },
            customizeItem: (item) => {
                switch(item.dataField) {
                    case 'LastName':
                    case 'FirstName':
                        item.editorOptions = {
                            value: ''
                        };
                        item.validationRules = [{
                            type: 'required'
                        }];
                        break;
                }
            }
        });

        assert.equal($container.find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).length, 2, '2 validation marks rendered');

        assert.equal($container.find('.dx-validator [id=\'dx_FormID_LastName\']').length, 1, 'validator for lastName');
        assert.equal($container.find('.dx-validator [id=\'dx_FormID_FirstName\']').length, 1, 'validator for lastName');
    });

    test('Validation rules and required marks render', function(assert) {
        const $container = $('#container');

        $container.dxLayoutManager({
            layoutData: {
                field1: 3,
                field2: 4,
                field3: 6,
                field4: 6
            },
            colCount: 4,
            height: 800,
            items: [{
                dataField: 'field1',
                validationRules: [{
                    type: 'numeric'
                }]
            }, {
                dataField: 'field2',
                validationRules: [{
                    type: 'numeric'
                }, {
                    type: 'required'
                }]
            }, {
                dataField: 'field3',
                validationRules: [{
                    type: 'required'
                }, {
                    type: 'numeric'
                }]
            }, {
                dataField: 'field4',
                validationRules: [{
                    type: 'required'
                }]
            }]
        });

        assert.equal($container.find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).length, 3, '3 required marks rendered');
        assert.equal($container.find('.' + FIELD_ITEM_CLASS).first().find('.' + FIELD_ITEM_REQUIRED_MARK_CLASS).length, 0, 'First item does not have required mark');
    });
});

QUnit.module('Templates', () => {
    test('Render template', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                test: 'abc'
            },
            items: [{
                dataField: 'test',
                template: function(data, container) {
                    assert.deepEqual(isRenderer(container), !!config().useJQuery, 'container is correct');

                    $(container).append($('<span>').text('Template'));

                    data.editorOptions.onValueChanged = function(args) {
                        data.component.option('layoutData.' + data.dataField, args.value);
                    };

                    $('<div>')
                        .dxTextArea(data.editorOptions)
                        .appendTo(container);
                }
            }]
        });

        const $fieldItemWidget = $testContainer.find('.' + FIELD_ITEM_CONTENT_CLASS);
        const spanText = $fieldItemWidget.find('span').text();
        const textArea = $fieldItemWidget.find('.dx-textarea').dxTextArea('instance');
        const layoutManager = $testContainer.dxLayoutManager('instance');

        assert.equal(spanText, 'Template');
        assert.equal(textArea.option('value'), layoutManager.option('layoutData.test'), 'Widget\'s value equal to bound datafield');
    });

    test('Render label template', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                test: 'abc'
            },
            items: [{
                dataField: 'test',
                template: function(data, container) {
                    assert.deepEqual(isRenderer(container), !!config().useJQuery, 'container is correct');

                    $(container).append($('<span>').text('Template'));

                    data.editorOptions.onValueChanged = function(args) {
                        data.component.option('layoutData.' + data.dataField, args.value);
                    };

                    $('<div>')
                        .dxTextArea(data.editorOptions)
                        .appendTo(container);
                }
            }]
        });

        const $fieldItemWidget = $testContainer.find('.' + FIELD_ITEM_CONTENT_CLASS);
        const spanText = $fieldItemWidget.find('span').text();
        const textArea = $fieldItemWidget.find('.dx-textarea').dxTextArea('instance');
        const layoutManager = $testContainer.dxLayoutManager('instance');

        assert.equal(spanText, 'Template');
        assert.equal(textArea.option('value'), layoutManager.option('layoutData.test'), 'Widget\'s value equal to bound datafield');
    });

    test('Check arguments of the label template', function(assert) {
        const labelTemplateStub = sinon.stub();
        const layoutManager = $('#container').dxLayoutManager({
            items: [{
                name: 'TestName',
                dataField: 'TestDataField',
                editorType: 'dxColorBox',
                editorOptions: {
                    text: 'TestText'
                },
                label: {
                    showColon: true,
                    template: labelTemplateStub
                }
            }]
        }).dxLayoutManager('instance');

        const args = labelTemplateStub.firstCall.args[0];
        assert.strictEqual(args.name, 'TestName', 'name argument');
        assert.strictEqual(args.text, 'Test Data Field:', 'text argument');
        assert.strictEqual(args.dataField, 'TestDataField', 'dataField argument');
        assert.strictEqual(args.editorType, 'dxColorBox', 'editorType argument');
        assert.deepEqual(args.editorOptions.inputAttr, {}, 'editorOptions.inputAttr argument');
        assert.strictEqual(args.editorOptions.name, 'TestDataField', 'editorOptions.name argument');
        assert.strictEqual(args.editorOptions.text, 'TestText', 'editorOptions.text argument');
        assert.equal(args.component, layoutManager, 'component argument');
    });

    test('Label template should not be called for group items', function(assert) {
        const labelTemplateStub = sinon.stub();
        $('#container').dxLayoutManager({
            items: [{
                itemType: 'group',
                caption: 'Personal info',
                label: {
                    template: labelTemplateStub
                }
            }]
        });

        assert.strictEqual(labelTemplateStub.callCount, 0, 'label template call count');
    });

    test('Check template bound to data', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                test: 'abc'
            },
            items: [{
                dataField: 'test',
                template: function(data, container) {
                    const $container = $(container);
                    $container.append($('<span>').text('Template'));

                    data.editorOptions.onValueChanged = function(args) {
                        data.component.option('layoutData.' + data.dataField, args.value);
                    };

                    $('<div>')
                        .dxTextArea(data.editorOptions)
                        .appendTo($container);
                }
            }]
        });

        const $fieldItemWidget = $testContainer.find('.' + FIELD_ITEM_CONTENT_CLASS);
        const textArea = $fieldItemWidget.find('.dx-textarea').dxTextArea('instance');
        const layoutManager = $testContainer.dxLayoutManager('instance');

        textArea.option('value', 'qwerty');

        assert.equal(layoutManager.option('layoutData.test'), 'qwerty', 'Correct data');
    });
});

QUnit.module('Public methods', () => {
    test('UpdateData, simple case', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                test1: 'abc',
                test2: 'xyz'
            }
        });

        const layoutManager = $testContainer.dxLayoutManager('instance');

        layoutManager.updateData('test2', 'qwerty');

        assert.equal(layoutManager.option('layoutData.test2'), 'qwerty', 'Correct data');
    });

    test('UpdateData, update with object', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                test1: 'abc',
                test2: 'xyz'
            }
        });

        const layoutManager = $testContainer.dxLayoutManager('instance');

        layoutManager.updateData({
            test1: 'xyz',
            test2: 'qwerty'
        });

        assert.deepEqual(layoutManager.option('layoutData'), {
            test1: 'xyz',
            test2: 'qwerty'
        }, 'Correct data');
    });

    test('Get editor instance', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                test1: 'abc',
                test2: 'xyz'
            },
            items: ['test1', {
                name: 'test3',
                editorType: 'dxNumberBox'
            }]
        });

        const layoutManager = $testContainer.dxLayoutManager('instance');

        assert.ok(!isDefined(layoutManager.getEditor('test2')), 'We has\'t instance for \'test2\' field');
        assert.ok(isDefined(layoutManager.getEditor('test1')), 'We have instance for \'test1\' field');
        assert.ok(isDefined(layoutManager.getEditor('test3')), 'We have instance for \'test3\' field');

        assert.equal(layoutManager.getEditor('test1').NAME, 'dxTextBox', 'It\'s textbox');
        assert.equal(layoutManager.getEditor('test3').NAME, 'dxNumberBox', 'It\'s numberBox');
    });
});

QUnit.module('Accessibility', () => {
    test('Check required state', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: ['test1', {
                dataField: 'test2',
                isRequired: true
            }]
        });

        const $fieldItems = $testContainer.find('.' + FIELD_ITEM_CLASS);

        assert.equal($fieldItems.first().find('input').attr('aria-required'), 'false', 'First item isn\'t required');
        assert.equal($fieldItems.last().find('input').attr('aria-required'), 'true', 'Second item is required');
    });

    test('Check help text', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                dataField: 'test1',
                helpText: 'help text'
            }]
        });

        const $fieldItem = $testContainer.find('.' + FIELD_ITEM_CLASS);
        const itemDescribedBy = $fieldItem.find('input').attr('aria-describedby');
        const helpTextID = $fieldItem.find('.' + FIELD_ITEM_HELP_TEXT_CLASS).attr('id');

        assert.equal(itemDescribedBy, helpTextID, 'Help text id and input\'s describedby attributes are equal');
    });

    test('Check aria-labelledby attribute for ariaTarget and id attr for label (T813296)', function(assert) {
        const items = supportedEditors.map((editorType, index) => ({ dataField: `test${index}`, editorType: editorType }));
        const layoutManager = $('#container').dxLayoutManager({ items }).dxLayoutManager('instance');
        const editorClassesRequiringIdForLabel = ['dx-radiogroup', 'dx-checkbox', 'dx-lookup', 'dx-slider', 'dx-rangeslider', 'dx-switch', 'dx-htmleditor']; // TODO: support "dx-calendar"

        items.forEach(({ dataField, editorType }) => {
            const editor = layoutManager.getEditor(dataField);
            const $ariaTarget = isFunction(editor._getAriaTarget) ? editor._getAriaTarget() : editor.$element();
            const $label = editor.$element().closest(`.${FIELD_ITEM_CLASS}`).children().first();
            const editorClassName = `dx-${editorType.toLowerCase().substr(2)}`;

            if(editorClassesRequiringIdForLabel.includes(editorClassName)) {
                if(!(!windowUtils.hasWindow() && editorType === 'dxHtmlEditor')) {
                    assert.ok($ariaTarget.attr('aria-labelledby'), `aria-labeledby attribute ${editorClassName}`);
                    assert.ok($label.attr('id'), `label id attribute for ${editorClassName}`);
                    assert.strictEqual($ariaTarget.attr('aria-labelledby'), $label.attr('id'), 'attributes aria-labelledby and labelID are equal');
                }
            } else {
                assert.equal($ariaTarget.eq(0).attr('aria-labelledby'), null, `aria-labeledby attribute ${editorClassName}`);
                assert.equal($label.attr('id'), null, `label id attribute for ${editorClassName}`);
            }
        });
    });
});

QUnit.module('Layout manager responsibility', {
    beforeEach: function() {
        responsiveBoxScreenMock.setup.call(this);
    },
    afterEach: function() {
        responsiveBoxScreenMock.teardown.call(this);
    }
}, () => {
    test('Middle screen size', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                dataField: 'test1'
            }, {
                dataField: 'test2'
            }],
            colCount: 2,
            onLayoutChanged: () => {}
        });

        assert.ok(!$testContainer.hasClass(LAYOUT_MANAGER_ONE_COLUMN), 'Layout manager hasn\'t one column mode');
    });

    test('Small screen size', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                dataField: 'test1'
            }, {
                dataField: 'test2'
            }],
            colCount: 2,
            onLayoutChanged: () => {}
        });

        this.updateScreenSize(600);

        assert.ok($testContainer.hasClass(LAYOUT_MANAGER_ONE_COLUMN), 'Layout manager has one column mode');
    });
});

QUnit.module('Button item', () => {
    test('Base rendering', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                itemType: 'button'
            }, {
                itemType: 'button',
                buttonOptions: { text: 'Test' }
            }]
        });

        const $buttonItems = $testContainer.find('.dx-field-button-item');
        const secondButtonText = $buttonItems.last().text();

        assert.equal($buttonItems.length, 2, 'There are 2 button items');
        assert.ok($buttonItems.first().hasClass('dx-field-item'), 'Item has a field-item class');
        assert.ok($buttonItems.first().hasClass('dx-field-button-item'), 'Item has a field-button-item class');
        assert.equal(secondButtonText, 'Test', 'Button gets the correct config');
    });

    test('cssClass', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                itemType: 'button',
                cssClass: 'privateClass'
            }]
        });

        const $buttonItem = $testContainer.find('.dx-field-button-item');

        assert.ok($buttonItem.hasClass('privateClass'), 'Item has a custom class');
    });

    test('column class', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            colCount: 2,
            items: [{
                itemType: 'button'
            }, {
                itemType: 'button'
            }]
        });

        const $buttonItems = $testContainer.find('.dx-field-button-item');

        assert.ok($buttonItems.first().hasClass('dx-col-0'), 'Correct column index');
        assert.ok($buttonItems.first().hasClass('dx-first-col'), 'Correct column index');
        assert.ok($buttonItems.last().hasClass('dx-col-1'), 'Correct column index');
        assert.ok($buttonItems.last().hasClass('dx-last-col'), 'Correct column index');
    });

    test('Horizontal alignment', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                itemType: 'button'
            }, {
                itemType: 'button',
                horizontalAlignment: 'left'
            }, {
                itemType: 'button',
                horizontalAlignment: 'center'
            }]
        });

        const $buttonItems = $testContainer.find('.dx-field-button-item');

        assert.equal($buttonItems.first().css('textAlign'), 'right', 'By default buttons align by the right');
        assert.equal($buttonItems.eq(1).css('textAlign'), 'left', 'Left alignment accepted');
        assert.equal($buttonItems.last().css('textAlign'), 'center', 'Center alignment accepted');
    });

    test('Vertical alignment', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            items: [{
                itemType: 'button'
            }, {
                itemType: 'button',
                verticalAlignment: 'center'
            }, {
                itemType: 'button',
                verticalAlignment: 'bottom'
            }]
        });

        const $buttonItems = $testContainer.find('.dx-field-button-item');

        assert.equal($buttonItems.first().parent().css('justifyContent'), 'flex-start', 'By default buttons align by the center');
        assert.equal($buttonItems.eq(1).parent().css('justifyContent'), 'center', 'Top alignment accepted');
        assert.equal($buttonItems.last().parent().css('justifyContent'), 'flex-end', 'Bottom alignment accepted');
    });
});

QUnit.module('Supported editors', () => {
    const createFormWithSupportedEditors = commonEditorOptions =>
        $('#container').dxLayoutManager({
            items: supportedEditors.map(supportedEditor => ({
                name: supportedEditor,
                editorType: supportedEditor,
                editorOptions: commonEditorOptions
            }))
        }).dxLayoutManager('instance');
    const getEditorClassName = editorName => `dx-${editorName.substr(2, editorName.length - 1).toLowerCase()}`;
    const checkSupportedEditors = callBack => supportedEditors.forEach(supportedEditor => callBack(supportedEditor, getEditorClassName(supportedEditor)));

    test('Render supported editors with default options', function(assert) {
        const layoutManager = createFormWithSupportedEditors();

        checkSupportedEditors((supportedEditor, className) => {
            const editorInstance = layoutManager.getEditor(supportedEditor);
            assert.equal(editorInstance.NAME, supportedEditor, `editor's name of the ${supportedEditor}`);
            assert.ok(editorInstance.$element().hasClass(className), `editor's css class of ${supportedEditor}`);
        });
    });

    test('Editor type for items where this option is not defined', function(assert) {
        const consoleErrorStub = sinon.stub(consoleUtils.logger, 'error');
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                name: 'Patti'
            },
            items: [{
                dataField: 'name'
            }, {
                name: 'Test Name'
            }]
        }).dxLayoutManager('instance');

        assert.equal(layoutManager._items.length, 2, 'items count');
        assert.equal(layoutManager._items[0].editorType, 'dxTextBox', '1 item');
        assert.equal(layoutManager._items[1].editorType, undefined, '2 item has no dataField');

        const errorMessage = consoleErrorStub.getCall(0).args[0];
        assert.equal(consoleErrorStub.callCount, 1, 'error was raised for item without dataField and editorType');
        assert.equal(errorMessage.indexOf('E1035 - The editor cannot be created'), 0);
        assert.ok(errorMessage.indexOf('See:\nhttp://js.devexpress.com/error/') > 0);
        consoleErrorStub.restore();
    });

    test('Render RangeSlider', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                range: [1, 5]
            },
            items: [{
                dataField: 'range',
                editorType: 'dxRangeSlider'
            }, {
                dataField: 'noRange',
                editorType: 'dxRangeSlider'
            }]
        }).dxLayoutManager('instance');

        assert.deepEqual(layoutManager.getEditor('range').option('value'), [1, 5], 'Editor\'s value correct');

        layoutManager.getEditor('noRange').option('value', [2, 6]);
        assert.deepEqual(layoutManager.option('layoutData.noRange'), [2, 6], 'data updated');
    });

    test('Form with dxRadioGroup that items are defined via \'dataSource\' option renders without error', function(assert) {
        const $testContainer = $('#container');
        let errorMessage;
        const _error = consoleUtils.logger.log;

        try {
            consoleUtils.logger.error = (message) => {
                errorMessage = message;
            };

            $testContainer.dxLayoutManager({
                items: [{
                    dataField: 'test1',
                    editorType: 'dxRadioGroup',
                    editorOptions: {
                        dataSource: [1, 2, 3]
                    }
                }]
            });

            assert.ok(!errorMessage, 'There is no error');
        } finally {
            consoleUtils.logger.error = _error;
        }
    });

    test('Set value to the dxSelectBox editor from data option', function(assert) {
        const $testContainer = $('#container');
        $testContainer.dxLayoutManager({
            layoutData: {
                simpleProducts: 'SuperLCD 70'
            },
            customizeItem: (item) => {
                item.editorType = 'dxSelectBox';
                item.editorOptions = {
                    dataSource: [
                        'HD Video Player',
                        'SuperHD Video Player',
                        'SuperPlasma 50',
                        'SuperLED 50',
                        'SuperLED 42',
                        'SuperLCD 55',
                        'SuperLCD 42',
                        'SuperPlasma 65',
                        'SuperLCD 70'
                    ]
                };
            }
        });

        const selectBox = $testContainer.find('.dx-selectbox').first().dxSelectBox('instance');
        assert.deepEqual(selectBox.option('value'), 'SuperLCD 70');
    });

    test('Set default value to the dxSelectBox editor when dataField is not contained in a formData', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Test'
            },
            items: ['Test', {
                dataField: 'simpleProducts',
                editorType: 'dxSelectBox',
                editorOptions: {
                    dataSource: [
                        'HD Video Player',
                        'SuperHD Video Player',
                        'SuperPlasma 50',
                        'SuperLED 50',
                        'SuperLED 42',
                        'SuperLCD 55',
                        'SuperLCD 42',
                        'SuperPlasma 65',
                        'SuperLCD 70'
                    ]
                }
            }]
        });

        const selectBox = $testContainer.find('.dx-selectbox').first().dxSelectBox('instance');
        assert.deepEqual(selectBox.option('value'), null);
    });

    test('Update value in dxSelectBox editor when data option is changed', function(assert) {
        const $testContainer = $('#container');
        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: {
                simpleProducts: 'SuperLCD 70'
            },
            customizeItem: (item) => {
                item.editorType = 'dxSelectBox';
                item.editorOptions = {
                    dataSource: [
                        'HD Video Player',
                        'SuperHD Video Player',
                        'SuperPlasma 50',
                        'SuperLED 50',
                        'SuperLED 42',
                        'SuperLCD 55',
                        'SuperLCD 42',
                        'SuperPlasma 65',
                        'SuperLCD 70'
                    ]
                };
            }
        }).dxLayoutManager('instance');

        layoutManager.updateData('simpleProducts', 'SuperLED 50');

        const selectBox = $testContainer.find('.dx-selectbox').first().dxSelectBox('instance');

        assert.deepEqual(selectBox.option('value'), 'SuperLED 50');
        assert.ok(!layoutManager._isFieldValueChanged);
    });

    test('Set value to the dxTagBox editor from data option', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                simpleProducts: ['HD Video Player', 'SuperLCD 70']
            },
            customizeItem: (item) => {
                item.editorType = 'dxTagBox';
                item.editorOptions = {
                    dataSource: [
                        'HD Video Player',
                        'SuperHD Video Player',
                        'SuperPlasma 50',
                        'SuperLED 50',
                        'SuperLED 42',
                        'SuperLCD 55',
                        'SuperLCD 42',
                        'SuperPlasma 65',
                        'SuperLCD 70'
                    ]
                };
            }
        });

        const tagBox = $testContainer.find('.dx-tagbox').first().dxTagBox('instance');

        assert.deepEqual(tagBox.option('value'), ['HD Video Player', 'SuperLCD 70']);
    });

    test('Set default value to the dxTagBox editor when dataField is not contained in a formData', function(assert) {
        const $testContainer = $('#container');

        $testContainer.dxLayoutManager({
            layoutData: {
                name: 'Test'
            },
            items: ['Test', {
                dataField: 'simpleProducts',
                editorType: 'dxTagBox',
                editorOptions: {
                    dataSource: [
                        'HD Video Player',
                        'SuperHD Video Player',
                        'SuperPlasma 50',
                        'SuperLED 50',
                        'SuperLED 42',
                        'SuperLCD 55',
                        'SuperLCD 42',
                        'SuperPlasma 65',
                        'SuperLCD 70'
                    ]
                }
            }]
        });

        const tagBox = $testContainer.find('.dx-tagbox').first().dxTagBox('instance');

        assert.deepEqual(tagBox.option('value'), []);
    });

    test('Update value in dxTagBox editor when data option is changed', function(assert) {
        const $testContainer = $('#container');
        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: {
                simpleProducts: ['HD Video Player', 'SuperLCD 70']
            },
            customizeItem: (item) => {
                item.editorType = 'dxTagBox';
                item.editorOptions = {
                    dataSource: [
                        'HD Video Player',
                        'SuperHD Video Player',
                        'SuperPlasma 50',
                        'SuperLED 50',
                        'SuperLED 42',
                        'SuperLCD 55',
                        'SuperLCD 42',
                        'SuperPlasma 65',
                        'SuperLCD 70'
                    ]
                };
            }
        }).dxLayoutManager('instance');

        layoutManager.updateData('simpleProducts', ['SuperLED 50', 'SuperLCD 70', 'SuperLCD 55']);

        const tagBox = $testContainer.find('.dx-tagbox').first().dxTagBox('instance');

        assert.deepEqual(tagBox.option('value'), ['SuperLED 50', 'SuperLCD 70', 'SuperLCD 55']);
        assert.ok(!layoutManager._isFieldValueChanged);
    });

    test('Update data option of layout manager when value is changed in the dxSelectBox editor', function(assert) {
        const $testContainer = $('#container');
        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: {
                simpleProducts: 'SuperLCD 70'
            },
            customizeItem: (item) => {
                item.editorType = 'dxSelectBox';
                item.editorOptions = {
                    dataSource: [
                        'HD Video Player',
                        'SuperHD Video Player',
                        'SuperPlasma 50',
                        'SuperLED 50',
                        'SuperLED 42',
                        'SuperLCD 55',
                        'SuperLCD 42',
                        'SuperPlasma 65',
                        'SuperLCD 70'
                    ]
                };
            }
        }).dxLayoutManager('instance');

        const selectBox = $testContainer.find('.dx-selectbox').first().dxSelectBox('instance');
        selectBox.option('value', 'SuperPlasma 50');

        assert.deepEqual(layoutManager.option('layoutData.simpleProducts'), 'SuperPlasma 50');
        assert.ok(!layoutManager._isValueChangedCalled);
    });

    test('Update data option of layout manager when value is changed in the dxTagBox editor', function(assert) {
        const $testContainer = $('#container');
        const layoutManager = $testContainer.dxLayoutManager({
            layoutData: {
                simpleProducts: ['HD Video Player', 'SuperLCD 70']
            },
            customizeItem: (item) => {
                item.editorType = 'dxTagBox';
                item.editorOptions = {
                    dataSource: [
                        'HD Video Player',
                        'SuperHD Video Player',
                        'SuperPlasma 50',
                        'SuperLED 50',
                        'SuperLED 42',
                        'SuperLCD 55',
                        'SuperLCD 42',
                        'SuperPlasma 65',
                        'SuperLCD 70'
                    ]
                };
            }
        }).dxLayoutManager('instance');

        const tagBox = $testContainer.find('.dx-tagbox').first().dxTagBox('instance');
        tagBox.option('value', ['SuperLCD 42', 'SuperPlasma 50']);

        assert.deepEqual(layoutManager.option('layoutData.simpleProducts'), ['SuperLCD 42', 'SuperPlasma 50']);
        assert.ok(!layoutManager._isValueChangedCalled);
    });

    test('Check the Html Editor with a value and toolbar items', function(assert) {
        const expectedText = 'This <b>text</b> for testing the <i>Html Editor</i>';
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                description: expectedText
            },
            items: [{
                dataField: 'description',
                editorType: 'dxHtmlEditor',
                editorOptions: {
                    toolbar: {
                        items: ['undo', 'redo']
                    }
                }
            }]
        }).dxLayoutManager('instance');

        assert.equal(layoutManager.getEditor('description').option('value'), expectedText, 'value of editor');
        if(windowUtils.hasWindow()) {
            assert.equal($('.dx-htmleditor-content').html(), '<p>This <strong>text</strong> for testing the <em>Html Editor</em></p>', 'HtmlEditor content');
            assert.equal($('.dx-undo-format.dx-button').length, 1, 'the undo button of toolbar is rendered');
            assert.equal($('.dx-redo-format.dx-button').length, 1, 'the redo button of toolbar is rendered');
        }
    });

    test('Check updating the layoutData when the value of the HtmlEditor is changed', function(assert) {
        const layoutManager = $('#container').dxLayoutManager({
            layoutData: {
                description: 'This <b>text</b> for testing the <i>Html Editor</i>'
            },
            items: [{
                dataField: 'description',
                editorType: 'dxHtmlEditor',
                editorOptions: {
                    toolbar: {
                        items: ['undo', 'redo']
                    }
                }
            }]
        }).dxLayoutManager('instance');

        const editor = layoutManager.getEditor('description');
        editor.option('value', 'new <b>value</b>');

        if(windowUtils.hasWindow()) {
            assert.equal($('.dx-htmleditor-content').html(), '<p>new <strong>value</strong></p>', 'HtmlEditor content');
            assert.deepEqual(layoutManager.option('layoutData'), { description: '<p>new <strong>value</strong></p>' }, 'layoutData');
        } else {
            assert.deepEqual(layoutManager.option('layoutData'), { description: 'new <b>value</b>' }, 'layoutData');
        }
    });
});

QUnit.module('ReadOnly option', () => {
    const getEditorClassName = (editorName) => (
        `dx-${editorName.substr(2, editorName.length - 1).toLowerCase()}`
    );

    const checkSupportedEditors = (callBack) => (
        supportedEditors.forEach((supportedEditor) => (
            callBack(supportedEditor, getEditorClassName(supportedEditor)))
        )
    );

    const isEditorReadOnly = ($container, editorClassName) => (
        $container
            .find(`.${FIELD_ITEM_CLASS} .${editorClassName}`)
            .hasClass(READONLY_STATE_CLASS)
    );

    test('editors should be read only when readOnly option is enabled in the editorOptions', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            items: supportedEditors.map(supportedEditor => ({
                name: supportedEditor,
                editorType: supportedEditor,
                editorOptions: { readOnly: true }
            }))
        });

        checkSupportedEditors((editor, className) => {
            assert.ok(isEditorReadOnly($testContainer, className), `${editor}: editor is read only`);
        });
    });

    test('editors should not be read only when readOnly option is enabled in form, but in the editorOptions it is set to false', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            readOnly: true,
            items: supportedEditors.map(supportedEditor => ({
                name: supportedEditor,
                editorType: supportedEditor,
                editorOptions: { readOnly: false }
            }))
        });

        checkSupportedEditors((editor, className) => {
            assert.notOk(isEditorReadOnly($testContainer, className), `${editor}: editor is not read only`);
        });
    });

    test('editors should be read only when readOnly option is enabled in form and in the editorOptions is not set', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            readOnly: true,
            items: supportedEditors.map(supportedEditor => ({
                name: supportedEditor,
                editorType: supportedEditor,
            }))
        });

        checkSupportedEditors((editor, className) => {
            assert.ok(isEditorReadOnly($testContainer, className), `${editor}: editor is read only`);
        });
    });

    test('editors should change their readonly state after change readOnly option in form if editorOptions.readOnly is not specified', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            readOnly: true,
            items: supportedEditors.map(supportedEditor => ({
                dataField: supportedEditor,
                editorType: supportedEditor,
            }))
        });

        checkSupportedEditors((editor, className) => {
            assert.ok(isEditorReadOnly($testContainer, className), `${editor}: editor is read only`);
        });

        $testContainer.dxLayoutManager('instance').option('readOnly', false);

        checkSupportedEditors((editor, className) => {
            assert.notOk(isEditorReadOnly($testContainer, className), `${editor}: editor is not read only`);
        });
    });

    test('editors should not change their readonly state after change readOnly option in form if readOnly option is also set in editors options', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            readOnly: false,
            items: supportedEditors.map(supportedEditor => ({
                dataField: supportedEditor,
                editorType: supportedEditor,
                editorOptions: { readOnly: false }
            }))
        });

        checkSupportedEditors((editor, className) => {
            assert.notOk(isEditorReadOnly($testContainer, className), `${editor}: editor is not read only`);
        });

        $testContainer.dxLayoutManager('instance').option('readOnly', true);

        checkSupportedEditors((editor, className) => {
            assert.notOk(isEditorReadOnly($testContainer, className), `${editor}: editor is not read only`);
        });
    });

    test('editors should not has readonly state if editorOptions.readOnly is null', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            readOnly: true,
            items: supportedEditors.map(supportedEditor => ({
                dataField: supportedEditor,
                editorType: supportedEditor,
                editorOptions: { readOnly: null }
            }))
        });

        checkSupportedEditors((editor, className) => {
            assert.notOk(isEditorReadOnly($testContainer, className), `${editor}: editor is not read only`);
        });
    });

    test('editors should has readonly state if editorOptions.readOnly is undefined and form readOnly is true', function(assert) {
        const $testContainer = $('#container').dxLayoutManager({
            readOnly: true,
            items: supportedEditors.map(supportedEditor => ({
                dataField: supportedEditor,
                editorType: supportedEditor,
                editorOptions: { readOnly: undefined }
            }))
        });

        checkSupportedEditors((editor, className) => {
            assert.ok(isEditorReadOnly($testContainer, className), `${editor}: editor is read only`);
        });
    });
});
