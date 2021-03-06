import React, { useState, useEffect } from "react";
import axios from "axios";
import { ApiBaseURL } from "../ApiBaseURL";
import { Redirect, Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { Editor } from "@tinymce/tinymce-react";
import { getToken } from "../HandleUser";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";

function EditPost() {
  let { slug } = useParams();
  const { handleSubmit, register, errors } = useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  var formData = new FormData();
  const { from } = { from: { pathname: "/bai-viet" } };
  const [redirect, setRedirect] = useState(false);
  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState([]);
  const [originalImg, setOriginalImg] = useState();
  const [category, setCategory] = useState();
  const errorMessage = (error) => {
    return <small className="error">{error}</small>;
  };

  const [files, setFiles] = useState([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setOriginalImg(null);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });
  const originalThumbs = () => {
    if (originalImg) {
      return (
        <aside>
          <div>
            <img className="img-fluid mt-3" src={originalImg} />
          </div>
        </aside>
      );
    } else {
      return null;
    }
  };
  const thumbs = files.map((file) => {
    return (
      <div key={file.name}>
        <img className="img-fluid mt-3" src={file.preview} />
      </div>
    );
  });
  useEffect(() => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const height = 500;
  const menubar = false;
  const plugins = "link image code table fullscreen hr lists";
  const toolbar =
    "fontselect fontsizeselect formatselect | " +
    "bold italic underline strikethrough subscript superscript | " +
    "blockquote removeformat | forecolor backcolor | " +
    "alignleft aligncenter alignright alignjustify | " +
    "indent outdent | numlist bullist | " +
    "link unlink | hr table image | fullscreen code | undo redo";
  const handleEditorChange = (event) => {
    setContent(event.target.getContent());
  };
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  const getCategories = () => {
    axios({
      method: "get",
      url: ApiBaseURL("category/load"),
    })
      .then((response) => {
        setCategories(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getPost = () => {
    axios({
      method: "get",
      url: ApiBaseURL("post/load/" + slug),
    })
      .then((response) => {
        setPost(response.data);
        setOriginalImg(response.data.img);
        setCategory(response.data.category);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    getCategories();
    getPost();
  }, []);
  const onSubmit = (values) => {
    setLoading(true);
    formData.append("title", values.title);
    formData.append("image", files[0]);
    formData.append("category", values.category);
    formData.append("tags", values.category);
    formData.append("summary", values.summary);
    formData.append("content", content);
    formData.append("id", post.id);
    axios({
      method: "post",
      url: ApiBaseURL("post/update"),
      headers: {
        "Content-Type": "multipart/form-data",
        token: getToken(),
      },
      data: formData,
    })
      .then((response) => {
        console.log(response.data);
        setLoading(false);
        setRedirect(true);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };
  if (redirect) {
    return <Redirect to={from} />;
  }
  return (
    <div>
      <Header />
      <div className="d-flex align-items-stretch">
        {/* Sidebar Navigation Start Here */}
        <Sidebar />
        {/* Sidebar Navigation End Here*/}
        <div className="page-content">
          {/* Page Header*/}
          <div className="page-header no-margin-bottom">
            <div className="container-fluid">
              <h2 className="h5 no-margin-bottom">Tạo bài viết</h2>
            </div>
          </div>
          {/* Breadcrumb*/}
          <div className="container-fluid">
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/admin">Trang chủ</Link>
              </li>
              <li className="breadcrumb-item active">Tạo bài viết</li>
            </ul>
          </div>
          <section className="no-padding-top">
            <div className="container-fluid">
              <div className="row">
                {/* Form Elements */}
                <div className="col-lg-12">
                  <div className="block">
                    <div className="title">
                      <strong>Tạo bài viết mới</strong>
                    </div>
                    <div className="block-body">
                      <form
                        className="form-horizontal"
                        onSubmit={handleSubmit(onSubmit)}
                      >
                        <div className="form-group row">
                          <label className="col-sm-2 form-control-label">
                            Tiêu đề
                          </label>
                          <div className="col-sm-10">
                            <input
                              type="text"
                              placeholder="Nhập tên bài viết (không quá 100 kí tự)"
                              className="form-control"
                              id="title"
                              name="title"
                              ref={register({
                                required: "Tiêu đề không được để trống.",
                                maxLength: {
                                  value: 70,
                                  message: "Tiêu đề tối đa 70 kí tự.",
                                },
                              })}
                              defaultValue={post.title}
                            />
                            {errors.title && errorMessage(errors.title.message)}
                          </div>
                        </div>
                        <div className="line" />
                        <div className="form-group row">
                          <label className="col-sm-2 form-control-label">
                            Ảnh bài viết
                          </label>
                          <div className="col-sm-10">
                            <div
                              {...getRootProps({
                                className: "dropzone form-control",
                              })}
                            >
                              <input {...getInputProps()} />
                              <p>
                                Kéo và thả hoặc click vào đây để chọn hình ảnh
                              </p>
                            </div>
                            {errors.image && errorMessage(errors.image.message)}
                            <aside>{thumbs}</aside>
                            {originalThumbs()}
                          </div>
                        </div>
                        <div className="line" />
                        <div className="form-group row">
                          <label className="col-sm-2 form-control-label">
                            Thể loại
                          </label>
                          <div className="col-sm-10">
                            <select
                              name="category"
                              className="form-control"
                              ref={register({
                                required: "Thể loại không được để trống.",
                              })}
                              value={category}
                              onChange={(event) => {
                                handleCategoryChange(event);
                              }}
                            >
                              <option value="">
                                -- Chọn thể loại bài viết --
                              </option>
                              {categories.map((value, key) => {
                                return (
                                  <option key={key} value={value.name}>
                                    {value.name}
                                  </option>
                                );
                              })}
                            </select>
                            {errors.category &&
                              errorMessage(errors.category.message)}
                          </div>
                        </div>
                        <div className="line" />
                        <div className="form-group row">
                          <label className="col-sm-2 form-control-label">
                            Tóm tắt bài viết
                          </label>
                          <div className="col-sm-10">
                            <textarea
                              className="form-control h-100"
                              id="summary"
                              name="summary"
                              rows={5}
                              placeholder="Nhập tóm tắt bài viết (không quá 300 kí tự)"
                              ref={register({
                                required:
                                  "Tóm tắt bài viết không được để trống.",
                                maxLength: {
                                  value: 150,
                                  message: "Tóm tắt bài viết tối đa 150 kí tự.",
                                },
                              })}
                              defaultValue={post.summary}
                            ></textarea>
                            {errors.summary &&
                              errorMessage(errors.summary.message)}
                          </div>
                        </div>
                        <div className="line" />
                        <div className="form-group row content">
                          <label className="col-sm-2 form-control-label">
                            Nội dung bài viết
                          </label>
                          <div className="col-sm-10">
                            <Editor
                              id="content"
                              className="form-control"
                              init={{
                                height,
                                menubar,
                                plugins,
                                toolbar,
                                image_title: true,
                                automatic_uploads: true,
                                file_picker_types: "image",
                                file_picker_callback: function (
                                  callback,
                                  value,
                                  meta
                                ) {
                                  var input = document.createElement("input");
                                  input.setAttribute("type", "file");
                                  input.setAttribute("accept", "image/*");
                                  input.onchange = function () {
                                    var file = this.files[0];
                                    var reader = new FileReader();
                                    reader.onload = function (event) {
                                      let formData = new FormData();
                                      formData.append("image", file);
                                      axios({
                                        method: "post",
                                        url: ApiBaseURL("upload"),
                                        headers: {
                                          "Content-Type": "multipart/form-data",
                                          token: getToken(),
                                        },
                                        data: formData,
                                      })
                                        .then((response) => {
                                          callback(response.data.link, {
                                            title: file.name,
                                          });
                                        })
                                        .catch((error) => {
                                          console.log(error);
                                        });
                                    };
                                    reader.readAsDataURL(file);
                                  };
                                  input.click();
                                },
                              }}
                              onChange={(event) => {
                                handleEditorChange(event);
                              }}
                              value={post.content}
                            />
                          </div>
                        </div>
                        <div className="line" />
                        <div className="form-group row">
                          <div className="col-sm-10 ml-auto">
                            <input
                              type="submit"
                              className="btn btn-primary mr-3"
                              value={
                                loading ? "Loading..." : "Cập nhật bài viết"
                              }
                              disabled={loading}
                            />
                            <Link
                              type="button"
                              className="btn btn btn-secondary"
                              to="/bai-viet"
                            >
                              Huỷ bỏ
                            </Link>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default EditPost;
