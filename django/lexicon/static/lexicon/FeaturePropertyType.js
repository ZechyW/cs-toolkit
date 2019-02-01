/**
 * For FeaturePropertyForm
 * Simple script to constrain `raw_value` to be either "True" or "False"
 * when `type` is set to "Boolean"
 */
(function($) {
  $(function() {
    // Get initial values (to be restored when the user switches between types)
    var $typeSelect = $("#id_type");
    var selectedOption = $typeSelect.val();

    var $valueInput = $("#id_raw_value");
    var booleanValue = "";
    var textValue = "";
    var numValue = 0;
    if (selectedOption === "Boolean") {
      booleanValue = $valueInput.val();
    }
    if (selectedOption === "Text") {
      textValue = $valueInput.val();
    }
    if (selectedOption === "Integer") {
      numValue = parseInt($valueInput.val());
    }

    // Set up listener, perform initial check
    $typeSelect.on("change", function() {
      setValueInput();
    });
    setValueInput();

    /**
     * Changes the `raw_value` input element to match the selected `type`
     */
    function setValueInput() {
      var selectedOption = $typeSelect.val();
      if (selectedOption === "Boolean" && !$valueInput.is("select")) {
        // Replace with select box
        $valueInput.replaceWith(
          $(
            '<select name="raw_value" class="form-control required" ' +
              'required="" id="id_raw_value">' +
              '  <option value="">---------</option>' +
              '  <option value="True">True</option>' +
              '  <option value="False">False</option>' +
              "</select>"
          )
        );
        $valueInput = $("#id_raw_value");

        // Update booleanValue on change
        $valueInput.val(booleanValue);
        $valueInput.on("change", function() {
          booleanValue = $(this).val();
        });
      }

      if (selectedOption === "Text" && !$valueInput.is("input[type=text]")) {
        // Replace with text input
        $valueInput.replaceWith(
          $(
            '<input type="text" name="raw_value" ' +
              'class="form-control vTextField required" maxlength="100" ' +
              'required="" id="id_raw_value">'
          )
        );
        $valueInput = $("#id_raw_value");

        // Update textValue on change
        $valueInput.val(textValue);
        $valueInput.on("change", function() {
          textValue = $(this).val();
        });
      }

      if (
        selectedOption === "Integer" &&
        !$valueInput.is("input[type=number]")
      ) {
        // Replace with text input
        $valueInput.replaceWith(
          $(
            '<input type="number" name="raw_value" ' +
              'class="form-control vTextField required" ' +
              'required="" id="id_raw_value">'
          )
        );
        $valueInput = $("#id_raw_value");

        // Update numValue on change
        $valueInput.val(numValue);
        $valueInput.on("change", function() {
          numValue = $(this).val();
        });
      }
    }
  });
  // eslint-disable-next-line no-undef
})(django.jQuery);
