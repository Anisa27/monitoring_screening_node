const conn = require("../config/conn.js");

const getScoring = (request, response) => {
  conn.conn.query(
    `SELECT order_id,json_result ->> 'order_created_date' as tanggal_order, json_result->> 'branch_desc' as cabang, json_result->> 'customer_name' as nama_customer, hasil_screening FROM sc1_order.order_application_scoring order by created_date desc limit 10`,
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const getDetailGradingSc1 = async (request, response) => {
  try {
    const { order_id } = request.params;
    let grading_id = [];
    let grading = [];
    let data = [];

    console.log("body " + order_id);
    const query1Result = await new Promise((resolve, reject) => {
      conn.conn.query(
        `SELECT order_id,param_grading_id,flag_result_grading,result_grading,created_date,updated_date FROM sc1_order.order_application_grading where order_id = $1`,
        [order_id],
        (error, results) => {
          if (error) {
            console.log("err " + error);
            throw error;
          }

          data = results.rows.map((row) => ({
            key: row.id,
            no_order: row.order_id,
            grading_id: row.param_grading_id,
            flag_result_grading: row.flag_result_grading,
            result_grading: row.result_grading,
            created_date: row.created_date,
            updated_date: row.updated_date,
          }));

          console.log("result ", data);

          if (data.length === 0) {
            console.log("No data returned from the query.");
          } else {
            grading_id = data.map((data_grading, index) => ({
              key: index,
              param_grading_id: data_grading.grading_id,
            }));
            // console.log("data ", data);
            // console.log("grading ", grading_id);
            resolve(data);
          }
        }
      );
    });

    const query2Result = await new Promise((resolve, reject) => {
      const quotedString = grading_id
        .map((obj) => `'${obj.param_grading_id}'`)
        .join(", ");
      conn.conn2.query(
        `SELECT param_grading_id, param_grading_desc from prm_master.mst_param_grading where param_grading_id IN (` +
          quotedString +
          `)`,
        (error, results) => {
          if (error) {
            throw error;
          }
          console.log("grading2 ", results.rows);
          grading = results.rows.map((row) => ({
            // key: row.id,
            param_grading_id: row.param_grading_id,
            param_grading_desc: row.param_grading_desc,
          }));
          // console.log("idd ", grading);
          resolve(grading);
          // response.status(200).json(data);
        }
      );
    });

    const result = await new Promise((resolve, reject) => {
      const resultArray = [];
      data.forEach((obj1) => {
        // Cari objek dengan kunci yang sama di array kedua
        const matchingObject = grading.find(
          (obj2) => obj1.grading_id === obj2.param_grading_id
        );

        // Jika ditemukan, tambahkan hasilnya ke resultArray
        if (matchingObject) {
          resultArray.push({
            no_order: obj1.no_order,
            grading_id: obj1.grading_id,
            flag_result_grading: obj1.flag_result_grading,
            result_grading: obj1.result_grading,
            created_date: obj1.created_date,
            updated_date: obj1.updated_date,
            grading_desc: matchingObject.param_grading_desc,
          });
        }

        resolve(resultArray);
      });
    });

    response.status(200).json({
      result,
    });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};

const getPayloadRequest = async (request, response) => {

  const { order_id } = request.params;
  let req = [];
  let payload = [];
  let data = [];

  try {
    const payloadData = await new Promise((resolve, reject) => {
      conn.conn.query(
        `select DISTINCT(brms_key_old), brms_key_new from sc1_order.param_brms_payload`,
        (error, results) => {
          if (error) {
            throw error;
          }
  
          payload = results.rows.map((row) => ({
            // key: row.id,
            brms_key_old: row.brms_key_old,
            brms_key_new: row.brms_key_new,
          }));
          console.log("pay ", payload);
          resolve(payload);
          // response.status(200).json(data);
        }
      );
    });
  
    const payloadReq = await new Promise((resolve, reject) => {
      conn.conn.query(
        `select result_brms from sc1_order.order_application_brms where order_id = $1`,
        [order_id],
        (error, results) => {
          if (error) {
            throw error;
          }
  
          req = results.rows[0].result_brms.params;
          console.log("req ", req);
          resolve(req);
          // response.status(200).json(data);
        }
      );
    });

    const payloadRequest = await new Promise((resolve, reject) => {
      for (const key in req) {
        if (payload.hasOwnProperty(key)) {
          payload[key] = req[key];
        }
      }
      resolve(payload)
    });

    response.status(200).json({
      payloadReq,
    });

  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }


 
};

const getPayloadReq = (request, response) => {
  const { order_id } = request.params;
  let request_payload = [];
 console.log('order '+order_id)

  conn.conn.query(
    `select payload_key_brms_old,payload_key_brms_new,payload_data_type,payload_str_val,payload_int_val,payload_dbl_val,payload_dbl_val_1,payload_dbl_val_2,payload_dbl_val_3,status,created_date,updated_date from sc1_order.order_application_brms_payload where order_id = $1`,[order_id],
    (error, results) => {
      if (error) {
        throw error;
      }

      console.log('result ',results.rows)

      request_payload = results.rows.map(row => ({
        // key: row.id,
        brms_key_old: row.payload_key_brms_old,
        brms_key_new: row.payload_key_brms_new,
        payload_data_type: row.payload_data_type,
        payload_str_val: row.payload_str_val,
        payload_int_val: row.payload_int_val,
        payload_dbl_val: row.payload_dbl_val,
        payload_dbl_val_1: row.payload_dbl_val_1,
        payload_dbl_val_2: row.payload_dbl_val_2,
        payload_dbl_val_3: row.payload_dbl_val_3,
        created_date: row.created_date,
        updated_date: row.updated_date,
        status : row.status
      }));

     console.log('res ',request_payload)
      const result_obj = {result: request_payload};
      response.status(200).json(result_obj);
    }
  );
};

const getPayloadResult = (request, response) => {
  const { order_id } = request.params;
  let result_brms = [];

  conn.conn.query(
    `select result_brms from sc1_order.order_application_brms where order_id = $1`,
    [order_id],
    (error, results) => {
      if (error) {
        throw error;
      }

      result_brms = results.rows[0].result_brms;
      const result_object = { result: result_brms.results };
      console.log("res ", result_object);
      response.status(200).json(result_object);
    }
  );
};

const getScoringSc2 = (request, response) => {
  conn.conn_sc2.query(
    `SELECT order_id,json_result ->> 'order_created_date' as tanggal_order, json_result->> 'branch_desc' as cabang, json_result->> 'customer_name' as nama_customer, hasil_screening FROM sc2_order.order_application_scoring order by created_date desc limit 10`,
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const getDetailGradingSc2 = async (request, response) => {
  try {
    const { order_id } = request.params;
    let grading_id = [];
    let grading = [];
    let data = [];

    console.log("body " + order_id);
    const query1Result = await new Promise((resolve, reject) => {
      conn.conn_sc2.query(
        `SELECT order_id,param_grading_id,flag_result_grading,result_grading,created_date,updated_date FROM sc2_order.order_application_grading where order_id = $1`,
        [order_id],
        (error, results) => {
          if (error) {
            console.log("err " + error);
            throw error;
          }

          data = results.rows.map((row) => ({
            key: row.id,
            no_order: row.order_id,
            grading_id: row.param_grading_id,
            flag_result_grading: row.flag_result_grading,
            result_grading: row.result_grading,
            created_date: row.created_date,
            updated_date: row.updated_date,
          }));

          console.log("result ", data);

          if (data.length === 0) {
            console.log("No data returned from the query.");
          } else {
            grading_id = data.map((data_grading, index) => ({
              key: index,
              param_grading_id: data_grading.grading_id,
            }));
            // console.log("data ", data);
            // console.log("grading ", grading_id);
            resolve(data);
          }
        }
      );
    });

    const query2Result = await new Promise((resolve, reject) => {
      const quotedString = grading_id
        .map((obj) => `'${obj.param_grading_id}'`)
        .join(", ");
      conn.conn2.query(
        `SELECT param_grading_id, param_grading_desc from prm_master.mst_param_grading where param_grading_id IN (` +
          quotedString +
          `)`,
        (error, results) => {
          if (error) {
            throw error;
          }
          console.log("grading2 ", results.rows);
          grading = results.rows.map((row) => ({
            // key: row.id,
            param_grading_id: row.param_grading_id,
            param_grading_desc: row.param_grading_desc,
          }));
          // console.log("idd ", grading);
          resolve(grading);
          // response.status(200).json(data);
        }
      );
    });

    const result = await new Promise((resolve, reject) => {
      const resultArray = [];
      data.forEach((obj1) => {
        // Cari objek dengan kunci yang sama di array kedua
        const matchingObject = grading.find(
          (obj2) => obj1.grading_id === obj2.param_grading_id
        );

        // Jika ditemukan, tambahkan hasilnya ke resultArray
        if (matchingObject) {
          resultArray.push({
            no_order: obj1.no_order,
            grading_id: obj1.grading_id,
            flag_result_grading: obj1.flag_result_grading,
            result_grading: obj1.result_grading,
            created_date: obj1.created_date,
            updated_date: obj1.updated_date,
            grading_desc: matchingObject.param_grading_desc,
          });
        }

        resolve(resultArray);
      });
    });

    response.status(200).json({
      result,
    });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};

const getPayloadRequestSc2 = (request, response) => {
  const { order_id } = request.params;
  let request_payload = [];
 console.log('order '+order_id)

  conn.conn_sc2.query(
    `select payload_key_brms_old,payload_key_brms_new,payload_data_type,payload_str_val,payload_int_val,payload_dbl_val,payload_dbl_val_1,payload_dbl_val_2,payload_dbl_val_3,status,created_date,updated_date from sc2_order.order_application_brms_payload where order_id = $1`,[order_id],
    (error, results) => {
      if (error) {
        throw error;
      }

      console.log('result ',results.rows)

      request_payload = results.rows.map(row => ({
        // key: row.id,
        brms_key_old: row.payload_key_brms_old,
        brms_key_new: row.payload_key_brms_new,
        payload_data_type: row.payload_data_type,
        payload_str_val: row.payload_str_val,
        payload_int_val: row.payload_int_val,
        payload_dbl_val: row.payload_dbl_val,
        payload_dbl_val_1: row.payload_dbl_val_1,
        payload_dbl_val_2: row.payload_dbl_val_2,
        payload_dbl_val_3: row.payload_dbl_val_3,
        created_date: row.created_date,
        updated_date: row.updated_date,
        status : row.status
      }));

     console.log('res ',request_payload)
      const result_obj = {result: request_payload};
      response.status(200).json(result_obj);
    }
  );
};

const getPayloadResultSc2 = (request, response) => {
  const { order_id } = request.params;
  let result_brms = [];

  conn.conn_sc2.query(
    `select result_brms from sc2_order.order_application_brms where order_id = $1`,
    [order_id],
    (error, results) => {
      if (error) {
        throw error;
      }

      result_brms = results.rows[0].result_brms;
      const result_object = { result: result_brms.results };
      console.log("res ", result_object);
      response.status(200).json(result_object);
    }
  );
};

const getScoringSc3 = (request, response) => {
  conn.conn_sc3.query(
    `SELECT order_id,json_result ->> 'order_created_date' as tanggal_order, json_result->> 'branch_desc' as cabang, json_result->> 'customer_name' as nama_customer, hasil_screening FROM sc3_order.order_application_scoring order by created_date desc limit 10`,
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const getDetailGradingSc3 = async (request, response) => {
  try {
    const { order_id } = request.params;
    let grading_id = [];
    let grading = [];
    let data = [];

    console.log("body " + order_id);
    const query1Result = await new Promise((resolve, reject) => {
      conn.conn_sc3.query(
        `SELECT order_id,param_grading_id,flag_result_grading,result_grading,created_date,updated_date FROM sc3_order.order_application_grading where order_id = $1`,
        [order_id],
        (error, results) => {
          if (error) {
            console.log("err " + error);
            throw error;
          }

          data = results.rows.map((row) => ({
            key: row.id,
            no_order: row.order_id,
            grading_id: row.param_grading_id,
            flag_result_grading: row.flag_result_grading,
            result_grading: row.result_grading,
            created_date: row.created_date,
            updated_date: row.updated_date,
          }));

          console.log("result ", data);

          if (data.length === 0) {
            console.log("No data returned from the query.");
          } else {
            grading_id = data.map((data_grading, index) => ({
              key: index,
              param_grading_id: data_grading.grading_id,
            }));
            // console.log("data ", data);
            // console.log("grading ", grading_id);
            resolve(data);
          }
        }
      );
    });

    const query2Result = await new Promise((resolve, reject) => {
      const quotedString = grading_id
        .map((obj) => `'${obj.param_grading_id}'`)
        .join(", ");
      conn.conn2.query(
        `SELECT param_grading_id, param_grading_desc from prm_master.mst_param_grading where param_grading_id IN (` +
          quotedString +
          `)`,
        (error, results) => {
          if (error) {
            throw error;
          }
          console.log("grading2 ", results.rows);
          grading = results.rows.map((row) => ({
            // key: row.id,
            param_grading_id: row.param_grading_id,
            param_grading_desc: row.param_grading_desc,
          }));
          // console.log("idd ", grading);
          resolve(grading);
          // response.status(200).json(data);
        }
      );
    });

    const result = await new Promise((resolve, reject) => {
      const resultArray = [];
      data.forEach((obj1) => {
        // Cari objek dengan kunci yang sama di array kedua
        const matchingObject = grading.find(
          (obj2) => obj1.grading_id === obj2.param_grading_id
        );

        // Jika ditemukan, tambahkan hasilnya ke resultArray
        if (matchingObject) {
          resultArray.push({
            no_order: obj1.no_order,
            grading_id: obj1.grading_id,
            flag_result_grading: obj1.flag_result_grading,
            result_grading: obj1.result_grading,
            created_date: obj1.created_date,
            updated_date: obj1.updated_date,
            grading_desc: matchingObject.param_grading_desc,
          });
        }

        resolve(resultArray);
      });
    });

    response.status(200).json({
      result,
    });
  } catch (error) {
    console.error("Error:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};

const getPayloadRequestSc3 = (request, response) => {
  const { order_id } = request.params;
  let request_payload = [];
 console.log('order '+order_id)

  conn.conn_sc3.query(
    `select payload_key_brms_old,payload_key_brms_new,payload_data_type,payload_str_val,payload_int_val,payload_dbl_val,payload_dbl_val_1,payload_dbl_val_2,payload_dbl_val_3,status,created_date,updated_date from sc3_order.order_application_brms_payload where order_id = $1`,[order_id],
    (error, results) => {
      if (error) {
        throw error;
      }

      console.log('result ',results.rows)

      request_payload = results.rows.map(row => ({
        // key: row.id,
        brms_key_old: row.payload_key_brms_old,
        brms_key_new: row.payload_key_brms_new,
        payload_data_type: row.payload_data_type,
        payload_str_val: row.payload_str_val,
        payload_int_val: row.payload_int_val,
        payload_dbl_val: row.payload_dbl_val,
        payload_dbl_val_1: row.payload_dbl_val_1,
        payload_dbl_val_2: row.payload_dbl_val_2,
        payload_dbl_val_3: row.payload_dbl_val_3,
        created_date: row.created_date,
        updated_date: row.updated_date,
        status : row.status
      }));

     console.log('res ',request_payload)
      const result_obj = {result: request_payload};
      response.status(200).json(result_obj);
    }
  );
};

const getPayloadResultSc3 = (request, response) => {
  const { order_id } = request.params;
  let result_brms = [];

  conn.conn_sc3.query(
    `select result_brms from sc3_order.order_application_brms where order_id = $1`,
    [order_id],
    (error, results) => {
      if (error) {
        throw error;
      }

      result_brms = results.rows[0].result_brms;
      const result_object = { result: result_brms.results };
      console.log("res ", result_object);
      response.status(200).json(result_object);
    }
  );
};


module.exports = {
  getScoring,
  getDetailGradingSc1,
  getPayloadResult,
  getPayloadRequest,
  getPayloadReq,
  getScoringSc2,
  getDetailGradingSc2,
  getPayloadRequestSc2,
  getPayloadResultSc2,
  getScoringSc3,
  getDetailGradingSc3,
  getPayloadRequestSc3,
  getPayloadResultSc3
};
