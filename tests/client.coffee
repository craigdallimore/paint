casper = require('casper').create()
casper.start './index.html', ->

    @test.assertTitle 'Paint', 'Title exists'


    # There should be a .paint element with a data-m and data-n attribute
    @test.assertExists '.paint', 'A .paint element exists'
    columns = @evaluate ->
        return document.querySelector('.paint').getAttribute 'data-m'
    rows = @evaluate ->
        return document.querySelector('.paint').getAttribute 'data-n'


    @test.assertEquals columns, '4', 'The data-m attribute is set'
    @test.assertEquals rows, '6', 'The data-n attribute is set'

    # There should be ul inside it with m columns and n rows
    @test.assertExists '.paint ul'
    @test.assertEvalEquals ->
        return document.querySelector('.paint ul').children.length
    , columns * rows, 'There should be the right number of pixels'


    # There should be a set of controls:
    @test.assertExists '.palette', 'A palette of controls exists'
    @test.assertExists '#btn-clear', 'A Clear button exists'
    @test.assertExists '#btn-single', 'A Single button exists'
    @test.assertExists '#btn-multi', 'A Multi button exists'
    @test.assertExists '#btn-fill', 'A Fill button exists'
    @test.assertExists '#select-color', 'A color selection exists'

    @click '#btn-single'
    @test.assertEvalEquals ->
        return document.querySelector('#btn-single').className
    , 'selected', 'Clicking the \'single\' button will show it is selected'
    @click '#btn-multi'
    @test.assertEvalEquals ->
        return document.querySelector('#btn-multi').className
    , 'selected', 'Clicking the \'multi\' button will show it is selected'
    @test.assertEvalEquals ->
        return document.querySelector('#btn-single').className
    , '', 'The \'single\' button will be deselected as a result'

    @click '#btn-single'
    @test.assertEvalEquals ->
        return document.querySelector('ul li:first-child').style.backgroundColor
    , '', 'The first pixel does not have a color set'
    #@click '#select-color'
    @click 'ul li:first-child'
    @test.info 'Clicked first pixel'

    @echo @evaluate ->
        sel = document.querySelector '#select-color'
        sel.value = 'ff0000'
        e = document.createEvent 'HTMLEvents'
        e.initEvent 'change', true, false
        sel.dispatchEvent e
        return sel.value
    @test.assertEvalEquals ->
        return document.querySelector('ul li:first-child').style.backgroundColor
    , 'rgb(255, 0, 0)', 'The first pixel is now red'
    # Clear
    # Single
    # Multi
    # Fill
    # Colours
    #
    # Clicking on clear should clear the canvas
    # After clicking on single, clicking in a cell will change its background colour
    # After clicking on multi, row/column mode is enabled:
    #   Clicking on a cell will highlight it
    #   Clicking somewhere in the same row will paint all the cells from the first cell to the clicked cell
    #   Clicking somewhere in the same column will paint all the cells from the first cell to the clicked cell
    #   Clicking off the canvas will de-activate the mode.
    #   Clicking elsewhere on the canvas will not do anything, but the mode will not be stopped
    # After clicking on 'fill' the fill mode is enabled
    #   Clicking on a cell will change it's colour. All adjacent cells of the same colour will also change colour.

# Light the fuse
casper.run ->
    @exit()
