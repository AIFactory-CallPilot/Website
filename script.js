var app = angular.module("app", ["myDirectives"]);
var myDirectives = angular.module("myDirectives", []);
var file_name = "";
var file_blob;
var uploaded_filename = "";

app.controller("UploadController", function ($scope) {
  this.upload = function () {
    console.log(
      "Uploading:",
      file_name || "no file selected!"
    );
    var formdata = new FormData();
    formdata.append("file", file_blob, file_name);

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
      mode: 'cors',
      headers: {
        'Access-Control-Allow-origin':'*',
      }
    };

    fetch("https://asia-northeast3-airy-environs-390809.cloudfunctions.net/test-for-upload", requestOptions)
      .then(response => response.json())
      .then(function(data) {
          uploaded_filename = data.body;
          console.log(
            "upload success. uploaded file_name: ",
            uploaded_filename
          );
          var parentElement = document.getElementById("upload");
          var alertDiv = document.getElementById("upload-result");
          if (!alertDiv) {
            alertDiv = document.createElement('div');  
            alertDiv.className = "alert alert-success";
            alertDiv.id = "upload-result";
          }
          alertDiv.innerHTML = "업로드 완료";
          parentElement.append(alertDiv);
      })
      .catch(error => console.log('error', error));
    };
  this.getResult = function() {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    
    // for test
    if (uploaded_filename === "") {
      uploaded_filename = "givcx-asdf.mp3";
    }

    fetch("https://get-response-sm7wohjfua-du.a.run.app/"+uploaded_filename, requestOptions)
      .then(response => response.json())
      .then(function(result){
        var parentElement = document.getElementById("result");
        var alertDiv = document.getElementById("summary-result");
        if (!alertDiv) {
          alertDiv = document.createElement('div');
          alertDiv.id = "summary-result";
        }
        
        if (result.progress === "요약 완료.") {
          alertDiv.className = "alert alert-success";
        } else {
          alertDiv.className = "alert alert-info";
        }
        alertDiv.innerHTML = result.progress;
        parentElement.prepend(alertDiv);
        
        '<div class="alert alert-info" id="alert"></div>'
        var splitted = result.summary.split("답변:");
        var question = splitted[0].replace("질문: ", "");
        var answer = splitted[1];
        var questionText = document.getElementById("question");
        questionText.value = question;
        var summaryText = document.getElementById("summary");
        summaryText.textContent = answer;
        var originalText = document.getElementById("original");
        originalText.textContent = result.text;
      })
      .catch(error => console.log('error', error));
  }
});

myDirectives.directive("myFileUpload", function ($compile) {
  return {
    restrict: "AE",
    require: "ngModel",
    scope: true,
    link: link,
  };

  function link(scope, element, attrs, ngModel) {
    var input = angular.element('<input type="file" style="display: none;">');

    input.bind("browse", function () {
      this.click();
    });

    input.bind("change", function (changed) {
      if (changed.target.files.length < 1) {
        return;
      }

      var fileName = changed.target.files[0].name;
      file_name = fileName;

      var reader = new FileReader();

      reader.onload = function (loaded) {
        scope.fileName = fileName;
        ngModel.$setViewValue(loaded.target.result);
      };
      file_blob = changed.target.files[0];
      reader.readAsDataURL(changed.target.files[0]);
    });

    $compile(input)(scope);
    element.append(input);

    scope.browse = function () {
      input.triggerHandler("browse");
    };

    scope.reset = function () {
      scope.fileName = null;
      file_name = null;
      ngModel.$setViewValue(null);
      var questionText = document.getElementById("question");
      questionText.value = "";
      var summaryText = document.getElementById("summary");
      summaryText.textContent = "";
      var originalText = document.getElementById("original");
      originalText.textContent = "";
    };
  }
});
