// Sciter Zip Extension v1.0


#include <ShObjIdl.h>
#include <wrl/client.h>
#include <fstream>

#include "sciter-x.h"
#include "sciter-x-threads.h"

#include "zip.h"

class extension : public sciter::om::asset<extension> {
public:
	// Helper functions 
	//auto toString(std::vector<uint8_t> data)		  { return std::string(data.begin(), data.end()); }
	//auto toString(std::string data)                   { return sciter::value(aux::utf2w(data).chars()); }
	sciter::value toString(char* data) { return sciter::value(aux::utf2w(data).chars()); }
	sciter::value toString(void* data) { return sciter::value(aux::utf2w((const char*)data).chars()); }
	const char* toChar(sciter::value data) {
		aux::w2utf data_utf(data.get(L"").c_str());
		return data_utf.c_str();
	}

	HWND hwnd;
	extension() {
		hwnd = this->hwnd;
	}
	

	// Set Taskbar progress and state
	bool setProgressBar(double value)
	{
		Microsoft::WRL::ComPtr<ITaskbarList3> taskbar;
		CoCreateInstance(CLSID_TaskbarList, NULL, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&taskbar));
		taskbar->HrInit();

		//if (value > 1.0) {
		//	taskbar->SetProgressState(hwnd, TBPF_INDETERMINATE);
		//}
		//else if (value < 0) {
		//	taskbar->SetProgressState(hwnd, TBPF_NOPROGRESS);
		//}
		//else {
			taskbar->SetProgressState(hwnd, TBPF_NORMAL);
			taskbar->SetProgressValue(hwnd, 50, 100);
			return IsWindow(hwnd);
		//}
	}

	sciter::value zipOpen(sciter::value fileName) {
		sciter::value Array = sciter::value::make_array();
		
		struct zip_t* zip = zip_open(toChar(fileName), 0, 'r');
		int i, n = zip_entries_total(zip);
		for (i = 0; i < n; ++i) {
			zip_entry_openbyindex(zip, i);
			{
				sciter::value Object = sciter::value::make_map();
				Object.set_item("name", sciter::value::make_string(zip_entry_name(zip)));
				Object.set_item("isDir", (bool)zip_entry_isdir(zip));
				//Object.set_item("size", zip_entry_size(zip));
				Array.append(Object);
				//Array.append(toString(std::string("wow")));
			}
			zip_entry_close(zip);
		}
		zip_close(zip);

		return Array;
	}
	//sciter::value zipOpen(sciter::value fileName) {
	//	sciter::value Array = sciter::value::make_array();

	//	fileName.get_bytes();
	//	zipfile_reader reader(fileName.get_bytes().begin(), fileName.get_bytes().end());
	//	std::vector<std::string> names = reader.filenames();

	//	for (std::string &i : names)
	//	{
	//		Array.append(sciter::value::make_string(i.c_str()));
	//	}
	//	for (i = 0; i < names.size(); ++i) {
	//		zip_entry_openbyindex(zip, i);
	//		{
	//			sciter::value Object = sciter::value::make_map();
	//			Object.set_item("name", sciter::value::make_string(zip_entry_name(zip)));
	//			Object.set_item("isDir", (bool)zip_entry_isdir(zip));
	//			//Object.set_item("size", zip_entry_size(zip));
	//			Array.append(Object);
	//			//Array.append(toString(std::string("wow")));
	//		}
	//		zip_entry_close(zip);
	//	}
	//	zip_close(zip);

	//	return Array;
	//}
	
	sciter::value zipRead(sciter::value fileName, sciter::value entry) {
		char* buf = NULL;
		size_t bufsize = 0;

		struct zip_t* zip = zip_open(toChar(fileName), 0, 'r');
		zip_entry_open(zip, toChar(entry));
		{
			//zip_entry_fread(zip, toChar(entry));
			zip_entry_read(zip, (void**)&buf, &bufsize);
		}
		zip_entry_close(zip);

		//std::ofstream myfilee("W:/sciter-js-sdk/bin/windows/x32/AAA.txt");
		//myfilee << "from the library";
		//myfilee.close();

		zip_close(zip);
		

		//free(buf);
		//return sciter::value::make_string(buf);
		return toString(buf);
	}

	auto zipImage(sciter::value fileName, sciter::value entry) {
		void* buf = NULL;
		size_t bufsize;

		struct zip_t* zip = zip_open(toChar(fileName), 0, 'r');
		zip_entry_open(zip, toChar(entry));
		{
			bufsize = zip_entry_size(zip);
			buf = calloc(sizeof(unsigned char), bufsize);
			//zip_entry_fread(zip, "W:/sciter-js-sdk/bin/windows/x32/image.jpg");

			zip_entry_read(zip, (void**)buf, &bufsize);
		}
		zip_entry_close(zip);

		std::ofstream myfilee("W:/sciter-js-sdk/bin/windows/x32/a-image.jpg");
		myfilee << buf;
		myfilee.close();

		zip_close(zip);


		//free(buf);
		//return buf;
		return toString(buf);
		//return sciter::value::make_string(buf).get_bytes();
		//return sciter::value::make_bytes(o, bufsize);
	}

	SOM_PASSPORT_BEGIN_EX(OS, extension)
		SOM_PASSPORT_FLAGS(SOM_EXTENDABLE_OBJECT)
		SOM_FUNCS(
			SOM_FUNC(setProgressBar),
			SOM_FUNC(zipOpen),
			SOM_FUNC(zipRead),
			SOM_FUNC(zipImage),
		)
	SOM_PASSPORT_END

};

SBOOL SCAPI SciterLibraryInit(ISciterAPI* psapi, SCITER_VALUE* plibobject)
{
	_SAPI(psapi);
	static sciter::om::hasset<extension> extension_root = new extension();
	*plibobject = sciter::value::wrap_asset(extension_root);
	return TRUE;
}
