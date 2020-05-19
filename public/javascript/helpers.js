function toggle(source) {
  checkboxes = document.getElementsByName("checkbox");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = source.checked;
  };
};
