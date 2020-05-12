function toggle(source) {
  checkboxes = document.getElementsByName("row");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = source.checked;
  };
};
